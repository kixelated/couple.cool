const paypal = require('@paypal/checkout-server-sdk')

const clientID = process.env.PAYPAL_CLIENT_ID
const clientSecret = process.env.PAYPAL_CLIENT_SECRET

const environment = new paypal.core.SandboxEnvironment(clientID, clientSecret)
const client = new paypal.core.PayPalHttpClient(environment)

const express = require('express')
const path = require('path')
const app = express()
const port = 8005

app.use(express.static(path.join(__dirname, '../web')))

app.use(express.json())

app.post('/create-order', (req, res) => {
	// https://developer.paypal.com/docs/api/orders/v2/#orders_create
	const request = new paypal.orders.OrdersCreateRequest();

	request.prefer("return=representation");
	request.requestBody({
		intent: 'CAPTURE',
		payer: {
			// name { given_name, surname }
			// email_address,
		},
		purchase_units: [{
			// reference_id
			amount: {
				currency_code: 'USD',
				value: '220.00',
			},
			description: "Luke&Rebecca's wedding registry",
			soft_descriptor: "L&R Wedding",
			// custom_id
			// invoice_id
			// items
			//   name
			//   unit_amount
			//   quantity
			//   description
			//   sku
			//   category: DIGITAL_GOODS
		}],
		application_context: {
			brand_name: "Luke&Rebecca Wedding Registry",
			shipping_preference: "NO_SHIPPING",
			user_action: "PAY_NOW",
		},
	});

	client.execute(request).then((order) => {
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
	const request = new paypal.orders.OrdersCaptureRequest(orderID);
	request.prefer("return=representation");
	request.requestBody({});

	client.execute(request).then((capture) => {
		console.log(JSON.stringify(capture, null, 2));
		//const captureID = capture.result.purchase_units[0].payments.captures[0].id;
		res.status(200).json({})
	}).catch((err) => {
		console.error(err)
		res.status(500).json({})
	})
})

app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
