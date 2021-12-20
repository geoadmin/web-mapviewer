const fs = require('fs')

// loading external utility function to read git metadata
const gitBranch = require('git-branch')

// if we are building from the CI, we should receive the git branch through ENV variable, otherwise we use the node git-branch utility to read it.
const branch = process.env.CODEBUILD_GIT_BRANCH
    ? process.env.CODEBUILD_GIT_BRANCH
    : gitBranch.sync()

// defines the base URL the application bundle will be deployed at
let publicPath = '/' // default to root of the bucket URL (or local address if served locally)

// When deploying, if branch is not `master` or `develop`, we use its name as the new base path for the app (it will be uploaded in a subfolder in S3)
if (process.env.DEPLOY && branch !== 'master' && branch !== 'develop') {
    publicPath = `/${branch.toLowerCase()}/`
}

// Getting package.json version in order to expose it to the app
const packageJson = JSON.parse(fs.readFileSync('./package.json'))
const version = packageJson.version || 0

module.exports = {
    publicPath,
    chainWebpack: (config) => {
        config
            .plugin('define')
            .tap((definitions) => {
                definitions[0]['process.env']['PACKAGE_VERSION'] = `"${version}"`
                return definitions
            })
            .end()
    },
}
