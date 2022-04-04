import jQuery from 'jquery'
window.$ = window.jQuery = jQuery

// Importing styling CSS libraries
// Must be require() as import will be done before window.jQuery = jQuery.
// If window.jQuery is not set before Bootstrap the plugins will not be loaded.
require('bootstrap/dist/js/bootstrap.bundle')
require('animate.css')

import { createApp } from 'vue'

import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import router from '@/router'
import './registerServiceWorker'

import setupProj4 from '@/utils/setupProj4'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

setupProj4()

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(store)

// setting up font awesome vue component
require('./setup-fontawesome')
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
app.component('FontAwesomeIcon', FontAwesomeIcon)

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    window.store = store
}

app.mount('#app')
