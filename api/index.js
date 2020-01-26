const paypal = require('./paypal')

const express = require('express')
const path = require('path')
const aws = require('aws-sdk')

aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'registry' });
aws.config.update({ region: 'us-west-2' })

const app = express()

app.use(express.static(path.join(__dirname, '../web')))
app.use(express.json())

app.get('/items', (req, res) => {
	const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

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

app.post('/create-order', async (req, res) => {
	try {
		const email = req.body.email;
		if (!email) {
			throw "missing email"
		}
	
		const itemId = req.body.item;
		if (!itemId) {
			throw "missing item"
		}

		const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

		const row = await dynamodb.getItem({
			TableName: 'registry.items',
			Key: { 'Id': { 'S': itemId }, },
			AttributesToGet: [ "Id", "Name", "Description", "Cost" ],
		}).promise()

		const item = row.Item
		if (!item) {
			throw "item does not exist"
		}

		// https://developer.paypal.com/docs/api/orders/v2/#orders_create
		const request = new paypal.sdk.orders.OrdersCreateRequest();

		request.prefer("return=representation");
		request.requestBody({
			intent: 'CAPTURE',
			payer: {
				email_address: email,
			},
			purchase_units: [{
				amount: {
					currency_code: 'USD',
					value: item.Cost.N,
					breakdown: {
						item_total: {
							currency_code: 'USD',
							value: item.Cost.N,
						},
					},
				},
				description: "Luke & Rebecca's wedding registry",
				soft_descriptor: "L&R Wedding",
				items: [{
					name: item.Name.S,
					unit_amount: {
						currency_code: 'USD',
						value: item.Cost.N,
					},
					quantity: '1',
					description: item.Description.S,
					category: "DIGITAL_GOODS",
					sku: item.Id.S,
				}],
			}],
			application_context: {
				brand_name: "Luke & Rebecca Wedding Registry",
				shipping_preference: "NO_SHIPPING",
				user_action: "PAY_NOW",
			},
		});

		const order = await paypal.client().execute(request)
		const orderID = order.result.id

		console.log(JSON.stringify(order, null, 2));
		res.status(200).json({ orderID: orderID })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

app.post('/capture-order', (req, res) => {
	try {
		const orderID = req.body.orderID;
		if (!orderID) {
			throw "missing order"
		}

		// TODO Verify item
		const item = req.body.item
		if (!item) {
			throw "missing item"
		}

		const name = req.body.name;
		if (!name) {
			throw "missing name"
		}

		const email = req.body.email;
		if (!email) { // TODO validate
			throw "missing email"
		}

		const message = req.body.message;

		const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

		const rowRequest = dynamodb.getItem({
			TableName: 'registry.items',
			Key: { 'Id': { 'S': item }, },
		})

		// https://developer.paypal.com/docs/api/orders/v2/#orders_capture
		const request = new paypal.sdk.orders.OrdersCaptureRequest(orderID);
		request.prefer("return=representation");
		request.requestBody({});

		paypal.client().execute(request).then((capture) => {
			console.log(JSON.stringify(capture, null, 2));
			//const captureID = capture.result.purchase_units[0].payments.captures[0].id;
			res.status(200).json({})
		})
	} catch(err) {
		console.error(err)
		res.status(500).json({ error: err })
	}
})

const port = 8005
app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
