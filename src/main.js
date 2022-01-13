// importing styling CSS libraries
import 'bootstrap'
import 'animate.css'

import { createApp } from 'vue'
import PortalVuePlugin from 'portal-vue'

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
app.use(PortalVuePlugin)

// setting up font awesome vue component
require('./setup-fontawesome')
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
app.component('FontAwesomeIcon', FontAwesomeIcon)

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    window.store = store
}

app.mount('#app')
