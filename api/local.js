const express = require('express')
const path = require('path')

const aws = require('aws-sdk')
aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'wedding' });
aws.config.update({ region: 'us-west-2' })

const app = express()

const api = require('./api')
const web = express.static(path.join(__dirname, '../web'))

app.use('/api', api)
app.use(web)

app.listen(8005)
console.log(`listening on port 8005`)
