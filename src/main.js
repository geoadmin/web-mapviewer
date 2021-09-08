import Vue from 'vue'

// importing styling CSS libraries
import 'bootstrap'
import 'animate.css'
import VAnimateCss from 'v-animate-css'

import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import router from '@/router'
import './registerServiceWorker'

import setupProj4 from '@/utils/setupProj4'
import { DEBUG, IS_TESTING_WITH_CYPRESS } from '@/config'

setupProj4()

Vue.config.productionTip = DEBUG

// setting up animate css
Vue.use(VAnimateCss)

// setting up font awesome vue component
require('./setup-fontawesome')
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('FontAwesomeIcon', FontAwesomeIcon)

// setting up component to replace some Vue component on the body (for modals and such)
import PortalVue from 'portal-vue'
Vue.use(PortalVue)

new Vue({
    store,
    i18n,
    router,
    render: (h) => h(App),
}).$mount('#app')

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    window.store = store
}
