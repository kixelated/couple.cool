const paypal = require('./paypal')

const express = require('express')
const path = require('path')
const aws = require('aws-sdk')

aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'registry' });
aws.config.update({ region: 'us-west-2' })

const app = express()
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

app.use(express.static(path.join(__dirname, '../web')))
app.use(express.json())

app.get('/items', (req, res) => {
	dynamodb.scan({
		TableName: 'registry.items',
		AttributesToGet: [ 'Id', 'Image', 'Name', 'Description', 'Cost' ],
	}).promise().then((data) => {
		res.status(200).json(data.Items);
	}).catch((err) => {
		console.error(err)
		res.status(500).json({})
	});
})

app.post('/purchase', async (req, res) => {
	try {
		const name = req.body.name;
		if (!name) {
			throw "missing name"
		}

		const email = req.body.email;
		if (!email) { // TODO validate
			throw "missing email"
		}

		const message = req.body.message;
		if (!message) {
			throw "missing message"
		}

		const orderID = req.body.orderID;
		if (!orderID) {
			throw "missing order"
		}

		const authorizationID = req.body.authorizationID;
		if (!authorizationID) {
			throw "missing authorization"
		}

		const itemID = req.body.itemID
		if (!itemID) {
			throw "missing item ID"
		}

		// Get the authorization info
		const authorizationRequest = new paypal.sdk.payments.AuthorizationsGetRequest(authorizationID)
		const authorizationPromise = paypal.client().execute(authorizationRequest)

		// Get the item information
		const itemPromise = await dynamodb.getItem({
			TableName: 'registry.items',
			Key: { 'Id': { 'S': itemID }, },
			AttributesToGet: [ "Id", "Cost", "BuyerOrder", "BuyerAuthorization", "BuyerCapture" ],
		}).promise()

		// Get the order information
		const orderRequest = new paypal.sdk.orders.OrdersGetRequest(orderID)
		const orderPromise = paypal.client().execute(orderRequest)

		// Validate the authorization
		const authorization = await authorizationPromise
		console.log("authorization:", JSON.stringify(authorization, null, 2))

		if (authorization.result.status != "CREATED") {
			throw "wrong authorization status: " + authorization.result.status
		}

		// If anything below fails, we want to void the authorization
		try {
			// Validate the item
			const item = (await itemPromise).Item
			console.log("item:", JSON.stringify(item, null, 2))

			if (!item) {
				throw "no such item: " + itemID
			}

			// See if the item was purchased already
			if (item.BuyerOrder || item.BuyerAuthorization || item.BuyerCapture) {
				throw "purchased already; purchase canceled"
			}

			// Validate the authorization amount
			let amount = authorization.result.amount
			if (amount.currency_code != 'USD') {
				throw "wrong authorization currency: " + amount.currency_code
			}

			if (parseInt(amount.value) != parseInt(item.Cost.N)) {
				throw "wrong authorization amount: " + amount.value + " != " + item.Cost.N
			}

			// Validate the order
			const order = await orderPromise
			console.log("order:", JSON.stringify(order, null, 2))

			if (order.result.status != "COMPLETED") {
				throw "wrong order status: " + order.result.status
			}

			if (itemID != order.result.purchase_units[0].custom_id) {
				throw "wrong order item ID"
			}

			amount = order.result.purchase_units[0].amount
			if (amount.currency_code != 'USD') {
				throw "wrong order currency: " + amount.currency_code
			}

			if (parseInt(amount.value) != parseInt(item.Cost.N)) {
				throw "wrong order amount: " + parseInt(amount.value) + " != " + item.Cost.N
			}

			// Update the registry table with our intent to capture.
			const update = await dynamodb.updateItem({
				TableName: 'registry.items',
				Key: { 'Id': { 'S': itemID }, },
				ExpressionAttributeNames: {
					"#BO": "BuyerOrder",
					"#BA": "BuyerAuthorization",
				},
				ExpressionAttributeValues: {
					":bo": { S: orderID },
					":ba": { S: authorizationID },
				},
				ConditionExpression: "attribute_not_exists(#BA) AND attribute_not_exists(#BO)",
				UpdateExpression: "SET #BO = :bo, #BA = :ba",
			}).promise()

			console.log("update:", JSON.stringify(update, null, 2));
		} catch (err) {
			// Void the authorization.
			// Otherwise it will take 29 days to void.
			const voidRequest = new paypal.sdk.payments.AuthorizationsVoidRequest(authorizationID)
			const voidResult = await paypal.client().execute(voidRequest)
			console.log("void: ", JSON.stringify(voidResult, null, 2));

			throw err
		}

		try {
			// Capture the authorization so we get PAID
			const captureRequest = new paypal.sdk.payments.AuthorizationsCaptureRequest(authorizationID)
			captureRequest.prefer("return=representation");
			captureRequest.requestBody({
				note_to_payer: "THANK YOU SO MUCH! We will email you at " + email + " when we purchase the gift!",
				final_capture: true,
			});

			const capture = await paypal.client().execute(captureRequest)
			console.log("capture:", JSON.stringify(capture, null, 2));

			if (capture.result.status != "COMPLETED") {
				throw "unknown capture status: " + capture.result.status
			}

			const captureID = capture.result.id

			try {
				console.log("performing second update")
				const update2 = await dynamodb.updateItem({
					TableName: 'registry.items',
					Key: { 'Id': { 'S': itemID }, },
					ExpressionAttributeNames: {
						"#BO": "BuyerOrder",
						"#BA": "BuyerAuthorization",
						"#BC": "BuyerCapture",

						"#BE": "BuyerEmail",
						"#BN": "BuyerName",
						"#BM": "BuyerMessage",
					},
					ExpressionAttributeValues: {
						":be": { S: email },
						":bn": { S: name },
						":bm": { S: message },
						":bo": { S: orderID },
						":ba": { S: authorizationID },
						":bc": { S: captureID },
					},
					ConditionExpression: "#BO = :bo AND #BA = :ba",
					UpdateExpression: "SET #BE = :be, #BN = :bn, #BM = :bm, #BC = :bc",
				}).promise()

				console.log("update2:", JSON.stringify(update2, null, 2));

				res.status(200).json({})
			} catch (err) {
				const refundRequest = new paypal.sdk.payments.CapturesRefundRequest(captureID)
				refundRequest.prefer("return=representation");
				refundRequest.requestBody({
					note_to_payer: "Something went wrong at the very end and this is embarassing but at least i am a capable programmer",
				});

				const refund = await paypal.client().execute(refundRequest)
				console.log("refund:", JSON.stringify(refundRequest, null, 2));

				throw err
			}
		} catch (err) {
			const undoUpdate = await dynamodb.updateItem({
				TableName: 'registry.items',
				Key: { 'Id': { 'S': itemID }, },
				ExpressionAttributeNames: {
					"#BO": "BuyerOrder",
					"#BA": "BuyerAuthorization",
				},
				ExpressionAttributeValues: {
					":bo": { S: orderID },
					":ba": { S: authorizationID },
				},
				ConditionExpression: "#BA = :ba AND #BO = :bo",
				UpdateExpression: "REMOVE #BO, #BA",
			}).promise()

			console.log("undo update:", JSON.stringify(undoUpdate, null, 2));

			throw err
		}
	} catch(err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

const port = 8005
app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
