// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

require('dotenv').config()
const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions')
const fs = require('fs/promises')

module.exports = (on, config) => {
    config = cypressBrowserPermissionsPlugin(on, config)

    on('task', {
        getFiles(folderName) {
            return fs.readdir(folderName)
        },
        async deleteFolder(folderName) {
            // eslint-disable-next-line no-console
            console.log('deleting folder %s', folderName)

            try {
                await fs.rmdir(folderName, {
                    recursive: true,
                    // maxRetries: 10,
                })
                return null
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error)
                throw error
            }
        },
        async findFiles({ folderName, extension }) {
            const files = await fs.readdir(folderName)

            return files.filter((file) => {
                const position = file.length - extension.length - 1
                return file.includes(`.${extension}`, position)
            })
        },
    })

    return Object.assign({}, config, {
        fixturesFolder: 'tests/e2e/fixtures',
        integrationFolder: 'tests/e2e/specs',
        screenshotsFolder: 'tests/e2e/screenshots',
        videosFolder: 'tests/e2e/videos',
        supportFile: 'tests/e2e/support/index.js',
        env: Object.assign({}, process.env),
    })
}
