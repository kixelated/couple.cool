const aws = require('aws-sdk')
const app = require('./app')

aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'registry' });
aws.config.update({ region: 'us-west-2' })

const port = 8005
app.listen(port)
console.log(`listening on port ${port}`)
