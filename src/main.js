import Vue from 'vue'

// importing styling CSS libraries
import "bootstrap"
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import "animate.css"

import App from './App.vue'
import store from '@/modules/store'
import i18n from '@/modules/i18n'
import './registerServiceWorker'

import { VueSvgIcon } from '@yzfe/vue-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'
import proj4 from "proj4";
import router from './router'

// proj4 comes with EPSG:4326 as default projection, we will now setup all extra necessary projections for the app
// setting up pseudo mercator projection in meters (EPSG:3857) as it will be used under the hood to store coordinates
proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
// defining LV03 and LV95 proj4 projection with lines from https://epsg.io/2056 and https://epsg.io/21781
proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:21781", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");


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
