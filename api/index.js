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

app.get('/items', async (req, res) => {
	try {
		const data = await dynamodb.scan({
			TableName: 'registry.items',
			AttributesToGet: [ 'Id', 'Image', 'Name', 'Description', 'Cost', 'BuyerName' ],
		}).promise()

		res.status(200).json(data.Items);
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err })
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
			throw "missing order id"
		}

		const itemID = req.body.itemID
		if (!itemID) {
			throw "missing item ID"
		}

		// Get the item information
		const itemPromise = await dynamodb.getItem({
			TableName: 'registry.items',
			Key: { 'Id': { 'S': itemID }, },
			AttributesToGet: [ "Id", "Cost", "BuyerOrder", "BuyerCapture" ],
		}).promise()

		// Get the order information
		const orderRequest = new paypal.sdk.orders.OrdersGetRequest(orderID)
		const orderPromise = paypal.client().execute(orderRequest)

		// Validate the item
		const item = (await itemPromise).Item
		console.log("item:", JSON.stringify(item, null, 2))

		if (!item) {
			throw "no such item: " + itemID
		}

		// See if the item was purchased already
		if (item.BuyerOrder || item.BuyerCapture) {
			throw "just purchased; find something else!"
		}

		// Validate the order
		const order = await orderPromise
		console.log("order:", JSON.stringify(order, null, 2))

		if (order.result.status != "APPROVED") {
			throw "wrong order status: " + order.result.status
		}

		if (itemID != order.result.purchase_units[0].custom_id) {
			throw "wrong order item ID"
		}

		const amount = order.result.purchase_units[0].amount
		if (amount.currency_code != 'USD') {
			throw "wrong order currency: " + amount.currency_code
		}

		if (parseInt(amount.value) != parseInt(item.Cost.N)) {
			throw "wrong order amount: " + parseInt(amount.value) + " != " + item.Cost.N
		}

		// Update the registry table with our intent to capture.
		const update = await dynamodb.updateItem({
			TableName: 'registry.items',
			Key: {
				'Id': { 'S': itemID },
			},
			ExpressionAttributeNames: {
				"#BO": "BuyerOrder",
			},
			ExpressionAttributeValues: {
				":bo": { S: orderID },
			},
			ConditionExpression: "attribute_not_exists(#BO)",
			UpdateExpression: "SET #BO = :bo",
		}).promise()

		try {
			// Capture the order so we get PAID
			const captureRequest = new paypal.sdk.orders.OrdersCaptureRequest(orderID)
			captureRequest.prefer("return=minimal");
			captureRequest.requestBody({});

			const capture = await paypal.client().execute(captureRequest)
			console.log("capture:", JSON.stringify(capture, null, 2));

			if (capture.result.status != "COMPLETED") {
				throw "unknown capture status: " + capture.result.status
			}

			const captureID = capture.result.id

			try {
				const update2 = await dynamodb.updateItem({
					TableName: 'registry.items',
					Key: { 'Id': { 'S': itemID }, },
					ExpressionAttributeNames: {
						"#BO": "BuyerOrder",
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
						":bc": { S: captureID },
					},
					ConditionExpression: "#BO = :bo", // not required but just to be safe
					UpdateExpression: "SET #BE = :be, #BN = :bn, #BM = :bm, #BC = :bc",
				}).promise()

				res.status(200).json({})
			} catch (err) {
				const refundRequest = new paypal.sdk.payments.CapturesRefundRequest(captureID)
				refundRequest.prefer("return=minimal");
				refundRequest.requestBody({
					note_to_payer: "Something went wrong at the very end and this is embarassing but at least i am a capable programmer",
				});

				const refund = await paypal.client().execute(refundRequest)
				console.log("refund:", JSON.stringify(refund, null, 2));

				throw err
			}
		} catch (err) {
			const undoUpdate = await dynamodb.updateItem({
				TableName: 'registry.items',
				Key: { 'Id': { 'S': itemID }, },
				ExpressionAttributeNames: {
					"#BO": "BuyerOrder",
				},
				ExpressionAttributeValues: {
					":bo": { S: orderID },
				},
				ConditionExpression: "#BO = :bo",
				UpdateExpression: "REMOVE #BO",
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
