// exposing the config in the logs
// Importing styling CSS libraries
import 'animate.css'
// setting up font awesome vue component
import './setup-fontawesome'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { createApp } from 'vue'
import VueSocialSharing from 'vue-social-sharing'

import {
    API_BASE_URL,
    API_SERVICE_ALTI_BASE_URL,
    API_SERVICE_KML_BASE_URL,
    API_SERVICE_SEARCH_BASE_URL,
    API_SERVICES_BASE_URL,
    APP_VERSION,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_TABLET,
    DATA_BASE_URL,
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    WMS_BASE_URL,
    WMS_TILE_SIZE,
    WMTS_BASE_URL,
} from '@/config'
import i18n from '@/modules/i18n'
import router from '@/router'
import store from '@/store'
import log from '@/utils/logging'
import setupChartJS from '@/utils/setupChartJS'

import App from './App.vue'

log.debug('Config is', {
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    APP_VERSION,
    API_BASE_URL,
    API_SERVICES_BASE_URL,
    API_SERVICE_ALTI_BASE_URL,
    API_SERVICE_KML_BASE_URL,
    API_SERVICE_SEARCH_BASE_URL,
    DATA_BASE_URL,
    WMTS_BASE_URL,
    WMS_BASE_URL,
    WMS_TILE_SIZE,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_TABLET,
})

tippy.setDefaultProps({ theme: 'light-border' })
setupChartJS()

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(store)
app.use(VueSocialSharing)

app.component('FontAwesomeIcon', FontAwesomeIcon)

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    log.info('Testing env detected, sharing the store through window reference')
    window.store = store
}

app.mount('#app')
