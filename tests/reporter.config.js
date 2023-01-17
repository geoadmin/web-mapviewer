const { defineConfig } = require('cypress')

module.exports = defineConfig({
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
        mochaFile: `./tests/results/e2e/e2e-test-report-[hash].xml`,
        includePending: true,
        outputs: true,
    },
})
