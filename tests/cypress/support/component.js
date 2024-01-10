import '../../../src/scss/main.scss'

import { mount } from 'cypress/vue'

Cypress.Commands.add('mount', (component, options = {}) => {
    // Setup options object
    options.global = options.global || {}
    options.global.stubs = options.global.stubs || {}
    options.global.stubs['transition'] = false
    options.global.components = options.global.components || {}
    options.global.plugins = options.global.plugins || []

    /* Add any global plugins */

    /* Add any global components */

    return mount(component, options)
})
