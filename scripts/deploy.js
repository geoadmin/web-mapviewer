// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'eu-central-1'}); // Frankfurt

// forcing profile to be `swisstopo-bgdi-builder`
const credentials = new AWS.SharedIniFileCredentials({profile: 'swisstopo-bgdi-builder'});
if (!credentials) {
    console.error("Profile 'swisstopo-bgdi-builder' is not defined");
    return -1;
}
AWS.config.credentials = credentials;

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Call S3 to list the buckets
s3.listBuckets(function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});
