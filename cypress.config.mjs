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
            on('before:browser:launch', (browser = {}, launchOptions) => {
                // see https://www.bigbinary.com/blog/how-we-fixed-the-cypress-out-of-memory-error-in-chromium-browsers
                if (['chrome', 'edge'].includes(browser.name)) {
                    if (browser.isHeadless) {
                        // Chromium browsers sandbox the pages, which increases the memory usage.
                        // Since we're running the Cypress tests on trusted sites,
                        // we can enable the --no-sandbox flag to reduce memory consumption
                        launchOptions.args.push('--no-sandbox')
                        // When running Cypress tests in headless mode,
                        // we can disable the WebGL graphics on the rendered pages
                        // to avoid additional memory usage by passing the --disable-gl-drawing-for-tests flag.
                        launchOptions.args.push('--disable-gl-drawing-for-tests')
                        // When running tests on low-resource machines,
                        // using hardware acceleration can impact performance.
                        // To avoid this, we can pass the --disable-gpu flag.
                        launchOptions.args.push('--disable-gpu')
                    }
                    // increasing Cypress heap size to 3.5GB (default is 500MB) to reduce crash while running test locally
                    launchOptions.args.push('--js-flags=--max-old-space-size=3500')
                }
                return launchOptions
            })

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
