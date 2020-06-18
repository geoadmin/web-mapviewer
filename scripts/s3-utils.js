
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Loading filesystem API
const fs = require('fs');

// Loading utility to detect mime types (and set the Content-type header accordingly)
const mime = require('mime-types')

// loading gzipper
const { gzipSync } = require('zlib');

/**
 * Load an AWS-SDK S3 instance for the given region, switch role if roleArn is defined
 * @param region the AWS region on which to connect to
 * @param roleArn a full ARN to a role that will be used to `aws sts assume-role` for this session
 * @returns {Promise<S3>}
 */
async function getS3(region, roleArn) {
    console.log('loading s3 service for region', region);
    const s3Options = {apiVersion: '2006-03-01'};

    // if a switch role is needed, we generate the session token before returning the S3 instance
    if (roleArn) {
        console.log('switching to role', roleArn)
        const sts = new AWS.STS({region});
        const switchRoleParams = {
            RoleArn: roleArn,
            RoleSessionName: 'SwitchRoleSession'
        };
        const assumeRoleStep1 = await sts.assumeRole(switchRoleParams).promise();

        s3Options.accessKeyId = assumeRoleStep1.Credentials.AccessKeyId;
        s3Options.secretAccessKey = assumeRoleStep1.Credentials.SecretAccessKey;
        s3Options.sessionToken = assumeRoleStep1.Credentials.SessionToken;
    }
    console.log('loading done for s3 service')
    return new AWS.S3(s3Options);
}

/**
 * Uploads a file to an S3 bucket using the S3 instance given in param
 * @param s3 an instance of AWS.S3
 * @param filePath a local file path to be uploaded on S3
 * @param bucket the bucket name (must be accessible through the current AWS profile)
 * @param bucketFilePath where the file should be uploaded on the S3 bucket (relative to the root of the bucket)
 */
function uploadFileToS3 (s3, filePath, bucket, bucketFilePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: bucket,
            Key: bucketFilePath,
            Body: gzipSync(data),
            ACL: 'public-read',
            ContentType: mime.lookup(filePath) || 'application/octet-stream',
            ContentEncoding: 'gzip'
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) {
                console.error(`Error while uploading file ${bucketFilePath} to bucket ${bucket}`, s3Err);
                process.exit(-1);
            }
            console.log(`File uploaded successfully at ${data.Location}`)
        });
    });
}

module.exports = {
    getS3,
    uploadFileToS3
}
