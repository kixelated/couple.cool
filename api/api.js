const express = require('express')
const path = require('path')
const aws = require('aws-sdk')
const paypal = require('@paypal/checkout-server-sdk')

const app = express()
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' })
const secrets = new aws.SecretsManager({ apiVersion: '2017-10-17' })

app.use(express.json())

app.get('/items', async (req, res) => {
	try {
		const paypalSecrets = await secrets.getSecretValue({ SecretId: "wedding_paypal" }).promise()
		const paypalCreds = JSON.parse(paypalSecrets.SecretString)
		const paypalEnv = new paypal.core.SandboxEnvironment(paypalCreds.id, paypalCreds.secret)
		const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv)

		const data = await dynamodb.scan({
			TableName: 'registry.items',
			AttributesToGet: [ 'Id', 'Image', 'Name', 'Description', 'Cost', 'CostDisplay', 'BuyerName' ],
		}).promise()

		for (const item of data.Items) {
			if (item.BuyerName) {
				item.BuyerName = { S: "Anonymous" }
			}
		}

		res.status(200).json(data.Items)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

app.post('/purchase', async (req, res) => {
	try {
		// Start fetching the paypal credentials
		const paypalPromise = await secrets.getSecretValue({ SecretId: "wedding_paypal" }).promise()

		const name = req.body.name
		if (!name) {
			throw "missing name"
		}

		const email = req.body.email
		if (!email) { // TODO validate
			throw "missing email"
		}

		const message = req.body.message
		if (!message) {
			throw "missing message"
		}

		const orderID = req.body.orderID
		if (!orderID) {
			throw "missing order id"
		}

		const itemID = req.body.itemID
		if (!itemID) {
			throw "missing item ID"
		}

		const cost = parseInt(req.body.cost)
		if (!cost || isNaN(cost) || cost < 1) {
			throw "missing cost"
		}

		// Get the item information
		const itemPromise = dynamodb.getItem({
			TableName: 'registry.items',
			Key: { 'Id': { 'S': itemID }, },
			AttributesToGet: [ "Id", "Cost", "BuyerOrder", "BuyerCapture" ],
		}).promise()

		// Set up the paypal client
		const paypalCreds = JSON.parse((await paypalPromise).SecretString)
		const paypalEnv = new paypal.core.SandboxEnvironment(paypalCreds.id, paypalCreds.secret)
		const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv)

		// Get the order information
		const orderRequest = new paypal.orders.OrdersGetRequest(orderID)
		const orderPromise = paypalClient.execute(orderRequest)

		// Validate the item
		const item = (await itemPromise).Item
		if (!item) {
			throw "no such item: " + itemID
		}

		console.log("item:", JSON.stringify(item, null, 2))

		// See if the item was purchased already
		if (item.BuyerOrder || item.BuyerCapture) {
			throw "just purchased; find something else!"
		}

		if (item.Cost.N && parseInt(item.Cost.N) != cost) {
			throw "paid doesn't match item cost: " + cost + " != " + item.Cost.N
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

		if (cost != parseInt(amount.value)) {
			throw "cost doesn't match paid: " + cost + " != " + amount.value
		}

		if (item.Cost.N && parseInt(amount.value) != parseInt(item.Cost.N)) {
			throw "wrong order amount: " + amount.value + " != " + item.Cost.N
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
			const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID)
			captureRequest.prefer("return=minimal");
			captureRequest.requestBody({});

			const capture = await paypalClient.execute(captureRequest)
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
				const refundRequest = new paypal.payments.CapturesRefundRequest(captureID)
				refundRequest.prefer("return=minimal");
				refundRequest.requestBody({
					note_to_payer: "Something went wrong at the very end and this is embarassing but at least i am a capable programmer",
				});

				const refund = await paypalClient.execute(refundRequest)
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

module.exports = app
