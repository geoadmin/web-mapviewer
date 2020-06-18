#!/usr/bin/env node

// describing possible and required arguments for this script (launch with --help to see the doc)
const argv = require('yargs')
    .usage('Usage: $0 <target> [options]')
    .command('dev [branchName]', 'Deploy dist/* files to DEV bucket')
    .command('int [branchName]', 'Deploy dist/* files to INT bucket')
    .command('prod', 'Deploy dist/* files to PROD bucket')
    .option('branchName', {
        describe: 'The git branch names if needed, it will create a subfolder on the S3 bucket if this is defined (otherwise files will be uploaded at the root of the bucket)',
        default: null
    })
    .option('role', {
        describe: 'AWS ARN for the role to use (will switch to role before uploading)',
        default: null
    })
    .option('region', {
        describe: 'AWS Region (required)',
        demandOption: 'An AWS region must set',
        type: 'string'
    })
    .option('bucket', {
        describe: 'AWS Bucket in which files should be uploaded (required)',
        demandOption: 'A bucket must be set',
        type: 'string'
    })
    .help()
    .argv;

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: argv.region});

// Loading filesystem API
const { resolve } = require('path');
const fs = require('fs');


// Declaring utility functions

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
async function* getFiles(dir) {
    const directoryEntries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of directoryEntries) {
        const resolvedEntry = resolve(dir, entry.name);
        if (entry.isDirectory()) {
            yield* getFiles(resolvedEntry);
        } else {
            yield resolvedEntry;
        }
    }
}
const uploadFileToS3 = (fileName, bucket) => {
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: bucket,
            Key: fileName,
            // Body: JSON.stringify(data, null, 2)
        };
        // console.log('payload for S3', params);
        // s3.upload(params, function(s3Err, data) {
        //     if (s3Err) throw s3Err
        //     console.log(`File uploaded successfully at ${data.Location}`)
        // });
    });
};

// Checking if index.html file is present in dist folder (if build has been done beforehand)
try {
    if (fs.existsSync('./dist/index.html')) {
        // file exists
    } else {
        console.error('Please build the project before trying to deploy')
        process.exit(-1);
    }
} catch (err) {
    console.error('Please build the project before trying to deploy')
    process.exit(-1);
}

// Create S3 service object
getS3(argv.region, argv.role).then(s3 => {

    console.log('woot', s3);
    // Call S3 to list the buckets
    s3.listBuckets(function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Buckets);
        }
    });

    (async () => {
        for await (const f of getFiles('./dist/')) {
            uploadFileToS3(f, argv.bucket);
        }
    })()
}).catch(console.error)
