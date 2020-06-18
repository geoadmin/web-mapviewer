#!/usr/bin/env node

// This is a Node.js script (requiring Node >= v12) that deploys what's inside the dist/ folder to
// a S3 bucket, defined by the target given as a script argument.

// describing possible arguments for this script (launch with --help to see the doc)
const argv = require('yargs')
    .usage('Usage: $0 <target> [options]')
    .command('dev', 'Deploy dist/* files to DEV bucket')
    .command('int', 'Deploy dist/* files to INT bucket')
    .command('prod', 'Deploy dist/* files to PROD bucket')
    .option('role', {
        describe: 'AWS ARN for the role to use (will switch to role before uploading)',
        default: null
    })
    .option('region', {
        describe: 'AWS Region (default is Frankfurt)',
        default: 'eu-central-1',
        type: 'string'
    })
    .demandCommand()
    .help()
    .showHelpOnFail(true, 'a target is needed')
    .argv;

// Declaring all possible buckets (keys are targets)
const buckets = {
    dev: 'web-mapviewer-dev',
    int: 'web-mapviewer-int',
    prod: 'web-mapviewer-prod'
};

// checking that the target is valid
if (argv._.length !== 1) {
    console.error('To many arguments, only one target should be provided')
    process.exit(-1);
}
const target = argv._[0];

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: argv.region});

// Loading filesystem API
const { resolve } = require('path');
const fs = require('fs');

// loading external utility function to read git metadata
const gitBranch = require('git-branch');

// Loading internal utility functions
const s3Utils = require('./s3-utils');
const fileUtils = require('./file-utils');

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
s3Utils.getS3(argv.region, argv.role)
.then(s3 => {

    const distFolderRelativePath = './dist/';
    const distFolderFullPath = resolve(distFolderRelativePath);

    (async () => {

        // Checking current branch
        const branch = await gitBranch();

        // if branch is not master and target is prod, we exit
        if (branch !== 'master' && target === 'prod') {
            console.error('It is forbidden to deploy anything else than `master` on the PROD environment');
            process.exit(-1);
        }
        // bucket folder will be branch name expect if we are on `master` and target is INT or PROD, or if we are on `develop` and target is DEV
        let bucketFolder;
        if (branch === 'master' && (target === 'int' || target === 'prod') || branch === 'develop' && target === 'dev') {
            bucketFolder = '';
        } else {
            bucketFolder = branch;
        }

        for await (const file of fileUtils.getFiles('./dist/')) {
            const bucketFilePath = bucketFolder + file.replace(distFolderFullPath, '');
            s3Utils.uploadFileToS3(s3, file, buckets[target], bucketFilePath);
        }
    })()
}).catch(console.error)
