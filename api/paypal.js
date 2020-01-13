const sdk = require('@paypal/checkout-server-sdk')

function client() {
	const clientID = process.env.PAYPAL_CLIENT_ID
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET

	const env = new sdk.core.SandboxEnvironment(clientID, clientSecret)
	return new sdk.core.PayPalHttpClient(env)
}

module.exports = {
	sdk: sdk,
	client: client,
}
