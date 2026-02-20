import 'cypress-real-events'
import { mount } from 'cypress/vue'

import i18n from '@/modules/i18n'

import '@/scss/main.scss'

Cypress.Commands.add('mount', (component, options = {}) => {
    // Setup options object
    options.global = options.global || {}
    options.global.stubs = options.global.stubs || {}
    options.global.components = options.global.components || {}
    options.global.plugins = options.global.plugins || []

    /* Add any global plugins */
    options.global.plugins.push({
        install(app) {
            app.use(i18n)
        },
    })

    return mount(component, options)
})

// Vite dev tools keep crashing our component tests, so we just skip any uncaught exception
Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
