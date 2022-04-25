import log from '@/utils/logging'
import jQuery from 'jquery'
window.$ = window.jQuery = jQuery

// exposing the config in the logs
import {
    API_BASE_URL,
    API_SERVICE_KML_BASE_URL,
    API_SERVICE_KML_STORAGE_BASE_URL,
    API_SERVICES_BASE_URL,
    APP_VERSION,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_TABLET,
    DATA_BASE_URL,
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    MAP_CENTER,
    TILEGRID_ORIGIN,
    TILEGRID_RESOLUTIONS,
    WMS_BASE_URL,
    WMS_TILE_SIZE,
    WMTS_BASE_URL,
} from '@/config'

log.debug('Config is', {
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    APP_VERSION,
    API_BASE_URL,
    API_SERVICES_BASE_URL,
    API_SERVICE_KML_BASE_URL,
    API_SERVICE_KML_STORAGE_BASE_URL,
    DATA_BASE_URL,
    WMTS_BASE_URL,
    WMS_BASE_URL,
    WMS_TILE_SIZE,
    TILEGRID_ORIGIN,
    TILEGRID_RESOLUTIONS,
    MAP_CENTER,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_TABLET,
})

// Importing styling CSS libraries
// Must be require() as import will be done before window.jQuery = jQuery.
// If window.jQuery is not set before Bootstrap the plugins will not be loaded.
import 'bootstrap/dist/js/bootstrap.bundle'
import 'animate.css'

import { createApp } from 'vue'
import VueSocialSharing from 'vue-social-sharing'

import App from './App.vue'
import store from '@/store'
import i18n from '@/modules/i18n'
import router from '@/router'

import setupProj4 from '@/utils/setupProj4'
setupProj4()

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(store)
app.use(VueSocialSharing, {
    // defining service-qrcode as a network for the sharing library
    networks: {
        qrcode: `${API_SERVICES_BASE_URL}qrcode/generate?url=@url`,
    },
})

// setting up font awesome vue component
import './setup-fontawesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
app.component('FontAwesomeIcon', FontAwesomeIcon)

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    log.info('Testing env detected, sharing the store through window reference')
    window.store = store
}

app.mount('#app')
