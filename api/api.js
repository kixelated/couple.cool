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
		const data = await dynamodb.scan({
			TableName: 'registry.items',
			AttributesToGet: [ 'Id', 'Image', 'Name', 'Description', 'Cost', 'CostDisplay', 'Sold' ],
		}).promise()

		res.status(200).json(data.Items)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

app.post('/purchase', async (req, res) => {
	try {
		// Start fetching the paypal credentials
		const paypalPromise = secrets.getSecretValue({ SecretId: "wedding_paypal" }).promise()

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
			AttributesToGet: [ "Id", "Cost", "Sold", ],
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
		if (item.Sold) {
			throw "just purchased; find something else!"
		}

		const itemCost = parseInt(item.Cost.N)

		if (isNaN(itemCost)) {
			throw "failed to parse item cost"
		}

		if (itemCost > 0 && itemCost != cost) {
			throw "paid doesn't match item cost: " + cost + " != " + itemCost
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

		const amountValue = parseInt(amount.value)
		if (cost != amountValue) {
			throw "cost doesn't match paid: " + cost + " != " + amountValue
		}

		if (itemCost > 0 && amountValue != itemCost) {
			throw "wrong order amount: " + amountValue + " != " + itemCost
		}

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
			// Insert an item into the payments table
			const put = await dynamodb.putItem({
				TableName: 'registry.payments',
				Item: {
					'Item': { S: itemID },
					'Order': { S: orderID },
					'Capture': { S: captureID },
					'Email': { S: email },
					'Name': { S: name },
					'Message': { S: message },
					'Amount': { N: cost.toString() },
				},
			}).promise()

			console.log("put:", JSON.stringify(put, null, 2));

			if (itemCost > 0) {
				// Update the items table to mark it SOLD
				const update = await dynamodb.updateItem({
					TableName: 'registry.items',
					Key: {
						'Id': { 'S': itemID },
					},
					ExpressionAttributeNames: {
						"#S": "Sold",
					},
					ExpressionAttributeValues: {
						":s": { BOOL: true },
					},
					ConditionExpression: "#S <> :s",
					UpdateExpression: "SET #S = :s",
				}).promise()

				console.log("update:", JSON.stringify(update, null, 2));
			}

			res.status(200).json({})
		} catch (err) {
			console.error(err)

			const refundRequest = new paypal.payments.CapturesRefundRequest(captureID)
			refundRequest.prefer("return=minimal");
			refundRequest.requestBody({
				note_to_payer: "Something went wrong at the very end. This is embarassing so here's a refund.",
			});

			const refund = await paypalClient.execute(refundRequest)

			console.log("refund:", JSON.stringify(refund, null, 2));

			throw err
		}
	} catch(err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

module.exports = app
