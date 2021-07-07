/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions')

const fs = require('fs')

module.exports = (on, config) => {
    config = cypressBrowserPermissionsPlugin(on, config)

    on('task', {
        getFiles(folderName) {
            return new Promise((resolve, reject) => {
                fs.readdir(folderName, (err, files) => {
                    if (err) {
                        return reject(err)
                    }

                    resolve(files)
                })
            })
        },
        removeFile(path) {
            return new Promise((resolve, reject) => {
                fs.unlink(path, (err) => {
                    if (err) {
                        return reject(err)
                    }

                    resolve(null)
                })
            })
        },
    })

    return Object.assign({}, config, {
        fixturesFolder: 'tests/e2e/fixtures',
        integrationFolder: 'tests/e2e/specs',
        screenshotsFolder: 'tests/e2e/screenshots',
        videosFolder: 'tests/e2e/videos',
        supportFile: 'tests/e2e/support/index.js',
    })
}
