// exposing the config in the logs
// Importing styling CSS libraries
import 'animate.css'
// setting up font awesome vue component
import './setup-fontawesome'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { createApp } from 'vue'

import {
    getApi3BaseUrl,
    getDataBaseUrl,
    getServiceAltiBaseUrl,
    getServiceKmlBaseUrl,
    getServiceSearchBaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
    getWmtsBaseUrl,
} from '@/config/baseUrl.config'
import { WMS_TILE_SIZE } from '@/config/map.config'
import {
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_TABLET,
} from '@/config/responsive.config'
import { APP_VERSION, ENVIRONMENT, IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import i18n from '@/modules/i18n'
import router from '@/router'
import store from '@/store'
import clickOutside from '@/utils/click-outside'
import log from '@/utils/logging'
import setupChartJS from '@/utils/setupChartJS'

import App from './App.vue'

log.debug('Config is', {
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    APP_VERSION,
    'API3 base URL': getApi3BaseUrl(),
    'Viewer services base URL': getViewerDedicatedServicesBaseUrl(),
    'service-alti': getServiceAltiBaseUrl(),
    'service-kml': getServiceKmlBaseUrl(),
    'service-search': getServiceSearchBaseUrl(),
    'data (GeoJSON)': getDataBaseUrl(),
    WMTS: getWmtsBaseUrl(),
    WMS: getWmsBaseUrl(),
    WMS_TILE_SIZE,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_TABLET,
})

tippy.setDefaultProps({ theme: 'light-border' })
setupChartJS()

const app = createApp(App)

if (ENVIRONMENT !== 'production') {
    app.config.performance = true
}

app.use(router)
app.use(i18n)
app.use(store)

app.directive('click-outside', clickOutside)
app.component('FontAwesomeIcon', FontAwesomeIcon)

// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    log.info('Testing env detected, sharing the store through window reference')
    window.store = store
}

app.mount('#app')
