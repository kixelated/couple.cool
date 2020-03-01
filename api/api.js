const express = require('express')
const path = require('path')
const aws = require('aws-sdk')
const paypal = require('@paypal/checkout-server-sdk')

const app = express()
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' })
const secrets = new aws.SecretsManager({ apiVersion: '2017-10-17' })
const ses = new aws.SES({ apiVersion: '2010-12-01' })

app.use(express.json())

app.get('/items', async (req, res) => {
	try {
		const data = await dynamodb.scan({
			TableName: 'couple.cool.items',
			AttributesToGet: [ 'Id', 'Image', 'Name', 'Description', 'Cost', 'CostDisplay', 'Sold' ],
		}).promise()

		res.status(200).json(data.Items)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

app.get('/test', async (req, res) => {
	const emails = []

	const resp = await secrets.getSecretValue({ SecretId: "couple.cool.rsvp" }).promise()
	const secret = JSON.parse(resp.SecretString)

	for (const email of emails) {
		await ses.sendTemplatedEmail({
			Destination: {
				ToAddresses: [ email ],
				CcAddresses: [ "rebe@couple.cool" ],
			},
			Template: "couple_cool_invite",
			TemplateData: JSON.stringify({
				code: secret.code,
				phone: secret.phone,
			}),
			Source: "luke@couple.cool",
		}).promise()

		// Sleep for a second to avoid getting rate limited
		await new Promise(resolve => setTimeout(resolve, 1000))
	}

	res.status(200).json({})
})

app.post('/rsvp', async (req, res) => {
	try {
		const secret = await secrets.getSecretValue({ SecretId: "couple.cool.rsvp" }).promise()
		const expected = JSON.parse(secret.SecretString).code

		const code = req.body.code
		if (!code) {
			throw "missing code"
		}

		if (code !== expected) {
			throw "wrong code"
		}

		if (req.body.coming !== "yes" && req.body.coming !== "no") {
			throw "missing coming"
		}

		const coming = (req.body.coming === "yes")

		const name = req.body.name
		if (!name) {
			throw "missing name"
		}

		const email = req.body.email
		if (!email) {
			throw "missing email"
		}

		const message = req.body.message || ""

		let guests = parseInt(req.body.guests)
		if (isNaN(guests) || guests < 0) {
			throw "missing guests"
		}

		// Include the person signing up
		guests += 1

		if (guests > 5) {
			throw "too many guests!"
		}

		const save = await dynamodb.putItem({
			TableName: 'couple.cool.rsvp',
			Item: {
				'Email': { S: email },
				'Name': { S: name },
				'Count': { N: guests.toString() },
				'Message': { S: message },
				'Coming': { BOOL: coming },
			},
			ConditionExpression: "attribute_not_exists(Email)",
		}).promise()

		let emailBody;
		if (coming) {
			emailBody = `${name} (${email}) and ${ guests - 1 } guests are coming! They said: <pre>${message}</pre>`
		} else {
			emailBody = `${name} (${email}) are not coming. They said: <pre>${message}</pre>`
		}

		await ses.sendEmail({
			Destination: {
				ToAddresses: [ "rebe@couple.cool" ],
			},
			Message: {
				Body: {
					Html : {
						Charset: "UTF-8",
						Data: emailBody,
					}
				},
				Subject: {
					Charset: "UTF-8",
					Data: "New RSVP"
				},
			},
			Source: "luke@couple.cool",
		}).promise()

		res.status(200).json({})
	} catch(err) {
		if (err.code === "ConditionalCheckFailedException") {
			err = "duplicate email address"
		}

		console.error(err)
		res.status(500).json({ error: err })
	}
})

app.post('/purchase', async (req, res) => {
	try {
		// Start fetching the paypal credentials
		const paypalPromise = secrets.getSecretValue({ SecretId: "couple.cool.paypal" }).promise()

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
			TableName: 'couple.cool.items',
			Key: { 'Id': { 'S': itemID }, },
			AttributesToGet: [ "Id", "Name", "Cost", "Sold", ],
		}).promise()

		// Set up the paypal client
		const paypalCreds = JSON.parse((await paypalPromise).SecretString)
		const paypalEnv = new paypal.core.LiveEnvironment(paypalCreds.id, paypalCreds.secret)
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
				TableName: 'couple.cool.payments',
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
					TableName: 'couple.cool.items',
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

		// Try sending an email but don't refund them if it fails!
		await ses.sendTemplatedEmail({
			Destination: {
				CcAddresses: [
					"rebe@couple.cool",
					"luke@couple.cool",
				],
				ToAddresses: [ email ],
			},
			Template: "couple_cool_thanks",
			TemplateData: JSON.stringify({
				name: escapeHtml(toTitleCase(name)),
				cost: cost,
				item: item.Name.S,
				message: escapeHtml(message),
			}),
			Source: "luke@couple.cool",
		}).promise()

		res.status(200).json({})
	} catch(err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function toTitleCase(phrase) {
	return phrase
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

module.exports = app
