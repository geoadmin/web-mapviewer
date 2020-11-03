import Vue from 'vue'

// importing styling CSS libraries
import "bootstrap"
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import './registerServiceWorker'

import { VueSvgIcon } from '@yzfe/vue-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'
import proj4 from "proj4";
import router from './router'

// setting up custom Swiss projection for proj4 (see https://epsg.io/2056)
proj4.defs(
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
);


Vue.config.productionTip = false;

Vue.component('icon', VueSvgIcon)

new Vue({
    store,
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');

// if we are testing with Cypress, we expose the store
if (window.Cypress) {
    window.store = store;
}
