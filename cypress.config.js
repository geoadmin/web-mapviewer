const { defineConfig } = require('cypress')

module.exports = defineConfig({
    video: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    retries: {
        runMode: 5,
        openMode: 0,
    },
    viewportWidth: 320,
    viewportHeight: 568,
    downloadsFolder: 'tests/e2e-cypress/downloads',
    fixturesFolder: 'tests/e2e-cypress/fixtures',
    screenshotsFolder: 'tests/e2e-cypress/screenshots',
    videosFolder: 'tests/e2e-cypress/videos',
    e2e: {
        setupNodeEvents(on, config) {
            // adding config so that Cypress' test can use import ... from '@/' notation
            return require('./tests/e2e-cypress/setup/index.js')(on, config)
        },
        baseUrl: 'http://localhost:8080',
        specPattern: 'tests/e2e-cypress/integration/**/*.*',
        supportFile: 'tests/e2e-cypress/support/index.js',
    },
})
