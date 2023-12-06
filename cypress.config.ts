import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig } from 'cypress'
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions'
import vitePreprocessor from 'cypress-vite'

module.exports = defineConfig({
    video: false,
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    numTestsKeptInMemory: 2,
    retries: {
        runMode: 1,
        openMode: 0,
    },
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: `./tests/reporter.config.js`,
    },
    viewportWidth: 320,
    viewportHeight: 568,
    downloadsFolder: 'tests/e2e-cypress/downloads',
    fixturesFolder: 'tests/e2e-cypress/fixtures',
    screenshotsFolder: 'tests/e2e-cypress/screenshots',
    videosFolder: 'tests/e2e-cypress/videos',
    e2e: {
        setupNodeEvents(on, config) {
            // setup Vite as the preprocessor for Cypress (it will automatically read vite.config.mts from the root of the project)
            // this way we can import helper functions in Cypress tests through @/ notation
            on('file:preprocessor', vitePreprocessor())

            // plugin that help tests define which browser permission is set or denied (e.g. location API)
            config = cypressBrowserPermissionsPlugin(on, config)

            // adding task to help manage (local/downloaded) files
            on('task', {
                getFiles(folderName) {
                    return readdirSync(folderName)
                },
                clearFolder(folderName) {
                    // eslint-disable-next-line no-console
                    console.log('clearing folder %s', folderName)

                    return new Promise((resolve, reject) => {
                        try {
                            if (existsSync(folderName)) {
                                const files = readdirSync(folderName)
                                files.forEach((file) => {
                                    unlinkSync(join(folderName, file))
                                })
                            }
                            resolve(true)
                        } catch (err) {
                            reject(err)
                        }
                    })
                },
                findFiles({ folderName, extension }) {
                    return new Promise((resolve, reject) => {
                        try {
                            const files = readdirSync(folderName)
                            resolve(
                                files.filter((f) => {
                                    const position = f.length - extension.length - 1
                                    return f.includes(`.${extension}`, position)
                                })
                            )
                        } catch (err) {
                            return reject(err)
                        }
                    })
                },
            })
        },
        baseUrl: 'http://localhost:8080',
        specPattern: 'tests/e2e-cypress/integration/**/*.*',
        supportFile: 'tests/e2e-cypress/support/index.js',
    },
})
