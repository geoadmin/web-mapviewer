// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './drawing'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// As Cypress doesn't give us pixel values for viewports, and we need those values to set it
// across a `describe` or `context` configuration, here we will build those values and give
// them later in our helper function

// see https://docs.cypress.io/api/commands/viewport#Arguments for values
const viewports = {
    'iphone-5': {
        width: 320,
        height: 568,
    },
    'ipad-2': {
        width: 768,
        height: 1024,
    },
    'macbook-11': {
        width: 1366,
        height: 768,
    },
}

export function forEachTestViewport(testFunction) {
    Object.entries(viewports).forEach(([name, dimensions]) => {
        testFunction(name, name === 'iphone-5', name === 'ipad-2', dimensions)
    })
}
