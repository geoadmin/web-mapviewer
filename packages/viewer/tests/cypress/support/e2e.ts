// ***********************************************************
// This example support/command.js is processed and
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
import type { Runnable } from 'mocha'

import './commands'
import './drawing'

Cypress.on('uncaught:exception', (err: Error, runnable: Runnable) => {
    Cypress.log({
        name: 'Uncaught error!',
        message: err.message,
        consoleProps() {
            return {
                err,
                runnable,
            }
        },
    })
    // returning false here prevents Cypress from failing the test
    return false
})
