import Vue from 'vue'

// importing styling CSS libraries
import 'bootstrap'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'animate.css'

import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import './registerServiceWorker'

import { VueSvgIcon } from '@yzfe/vue-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'
import router from './router'
import setupProj4 from '@/utils/setupProj4'

setupProj4()

Vue.config.productionTip = false

Vue.component('icon', VueSvgIcon)

new Vue({
  store,
  i18n,
  router,
  render: (h) => h(App),
}).$mount('#app')

// if we are testing with Cypress, we expose the store
if (window.Cypress) {
  window.store = store
}
