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
		AttributesToGet: [ 'Id', 'Name', 'Description', 'Cost', 'Buyer', ],
	}).promise().then((data) => {
		res.status(200).json(data.Items);
	}).catch((err) => {
		console.error(err)
		res.status(500).json({})
	});
})

app.post('/create-order', (req, res) => {
	// https://developer.paypal.com/docs/api/orders/v2/#orders_create
	const request = new paypal.sdk.orders.OrdersCreateRequest();

	request.prefer("return=representation");
	request.requestBody({
		intent: 'CAPTURE',
		payer: {
			// email_address,
		},
		purchase_units: [{
			amount: {
				currency_code: 'USD',
				value: '220.00',
				breakdown: {
					item_total: {
						currency_code: 'USD',
						value: '220.00',
					},
				},
			},
			description: "Luke & Rebecca's wedding registry",
			soft_descriptor: "L&R Wedding",
			items: [{
				name: "Penny Sausage",
				unit_amount: {
					currency_code: 'USD',
					value: '220.00',
				},
				quantity: '1',
				description: "Buy Penny from Andrew",
				category: "DIGITAL_GOODS",
				sku: '1', // id
			}],
		}],
		application_context: {
			brand_name: "Luke & Rebecca Wedding Registry",
			shipping_preference: "NO_SHIPPING",
			user_action: "PAY_NOW",
		},
	});

	paypal.client().execute(request).then((order) => {
		console.log(JSON.stringify(order, null, 2));
		res.status(200).json({
			orderID: order.result.id,
		})
	}).catch((err) => {
		console.error(err)
		res.status(500).json({})
	})
})

app.post('/capture-order', (req, res) => {
	const orderID = req.body.orderID;

	// https://developer.paypal.com/docs/api/orders/v2/#orders_capture
	const request = new paypal.sdk.orders.OrdersCaptureRequest(orderID);
	request.prefer("return=representation");
	request.requestBody({});

	paypal.client().execute(request).then((capture) => {
		console.log(JSON.stringify(capture, null, 2));
		//const captureID = capture.result.purchase_units[0].payments.captures[0].id;
		res.status(200).json({})
	}).catch((err) => {
		console.error(err)
		res.status(500).json({})
	})
})

const port = 8005
app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
