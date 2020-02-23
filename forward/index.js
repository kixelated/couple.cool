var LambdaForwarder = require("aws-lambda-ses-forwarder");

exports.handler = function(event, context, callback) {
  // See aws-lambda-ses-forwarder/index.js for all options.
  var overrides = {
    config: {
      fromEmail: "luke@couple.cool",
      emailBucket: process.env.EMAIL_BUCKET_NAME,
      emailKeyPrefix: "",
      forwardMapping: {
        "luke@couple.cool": [
          "kixelated@gmail.com",
        ],
        "rebe@couple.cool": [
          "rebeccastreicker@gmail.com",
        ],
      }
    }
  };
  LambdaForwarder.handler(event, context, callback, overrides);
};
