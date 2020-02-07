const aws = require('aws-sdk')
aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'wedding' });
aws.config.update({ region: 'us-west-2' })

const app = require('./app')
app.listen(8005)
console.log(`listening on port 8005`)
