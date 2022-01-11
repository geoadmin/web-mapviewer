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

export function forEachTestViewport(testFunction) {
    ;['iphone-5', 'ipad-2', 'macbook-11'].forEach((viewport) => {
        testFunction(viewport, viewport === 'iphone-5', viewport === 'ipad-2')
    })
}
