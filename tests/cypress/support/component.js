import '../../../src/scss/main.scss'
import 'cypress-real-events'

import { mount } from 'cypress/vue'
import tippy from 'tippy.js'

import i18n from '@/modules/i18n'

tippy.setDefaultProps({ theme: 'light-border' })

Cypress.Commands.add('mount', (component, options = {}) => {
    // Setup options object
    options.global = options.global || {}
    options.global.stubs = options.global.stubs || {}
    options.global.stubs['transition'] = false
    options.global.components = options.global.components || {}
    options.global.plugins = options.global.plugins || []

    /* Add any global plugins */
    options.global.plugins.push({
        install(app) {
            app.use(i18n)
        },
    })

    /* Add any global components */

    return mount(component, options)
})
