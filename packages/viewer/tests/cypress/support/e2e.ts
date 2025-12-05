Cypress.on('uncaught:exception', (err, runnable) => {
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

import './commands'
import './drawing'
