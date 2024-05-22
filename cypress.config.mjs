import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig } from 'cypress'
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
    projectId: 'fj2ezv',
    video: false,
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    numTestsKeptInMemory: 2,
    watchForFileChanges: false, // Prevent auto run on file changes

    retries: {
        runMode: 3,
        openMode: 0,
    },

    viewportWidth: 320,
    viewportHeight: 568,
    fixturesFolder: 'tests/cypress/fixtures',
    downloadsFolder: 'tests/cypress/downloads',
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',

    e2e: {
        setupNodeEvents(on, config) {
            // setup Vite as the preprocessor for Cypress (it will automatically read vite.config.mts from the root of the project)
            // this way we can import helper functions in Cypress tests through @/ notation
            on(
                'file:preprocessor',
                vitePreprocessor({ configFile: './vite.config.mts', mode: 'development' })
            )

            // plugin that help tests define which browser permission is set or denied (e.g. location API)
            cypressBrowserPermissionsPlugin(on, config)

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
        specPattern: 'tests/cypress/tests-e2e/**/*.cy.js',
        supportFile: 'tests/cypress/support/e2e.js',
    },

    component: {
        devServer: {
            framework: 'vue',
            bundler: 'vite',
        },
        specPattern: 'tests/cypress/tests-component/**/*.cy.js',
        supportFile: 'tests/cypress/support/component.js',
        indexHtmlFile: 'tests/cypress/support/component-index.html',
    },
})
