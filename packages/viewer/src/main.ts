// Importing styling CSS libraries
import 'animate.css'

// setting up font awesome vue component
import '@/setup-fontawesome'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { registerProj4 } from '@swissgeo/coordinates'
import SwissGeoElevationProfile from '@swissgeo/elevation-profile'
import log, { LogLevel } from '@swissgeo/log'
import {
    getApi3BaseUrl,
    getDataBaseUrl,
    getServiceKmlBaseUrl,
    getViewerDedicatedServicesBaseUrl,
    getWmsBaseUrl,
    getWmtsBaseUrl,
} from '@swissgeo/staging-config'
import {
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_TABLET,
    WMS_TILE_SIZE,
} from '@swissgeo/staging-config/constants'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { createApp } from 'vue'

import App from '@/App.vue'
import { APP_VERSION, ENVIRONMENT, IS_TESTING_WITH_CYPRESS } from '@/config'
import i18n from '@/modules/i18n'
import router from '@/router'
import store from '@/store'
import clickOutside from '@/utils/click-outside'

if (ENVIRONMENT !== 'production') {
    // when not on PROD, we want all log levels available
    log.wantedLevels = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error]
}

log.debug('Config is', {
    ENVIRONMENT,
    IS_TESTING_WITH_CYPRESS,
    APP_VERSION,
    'API3 base URL': getApi3BaseUrl(),
    'Viewer services base URL': getViewerDedicatedServicesBaseUrl(),
    'service-kml': getServiceKmlBaseUrl(),
    'data (GeoJSON)': getDataBaseUrl(),
    WMTS: getWmtsBaseUrl(),
    WMS: getWmsBaseUrl(),
    WMS_TILE_SIZE,
    BREAKPOINT_PHONE_WIDTH,
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_TABLET,
    env: import.meta.env,
})

registerProj4(proj4)
// register any custom projection in OpenLayers
register(proj4)

const app = createApp(App)

if (ENVIRONMENT === 'production') {
    app.config.performance = true
    // by default, index levels are ERROR and WARNING; that goes well for PROD staging (no changes)
}

app.use(i18n)
app.use(router)

app.use(store)
// if we are testing with Cypress, we expose the store
if (IS_TESTING_WITH_CYPRESS) {
    log.info('Testing env detected, sharing the store through window reference')
    window.store = store
}

app.directive('click-outside', clickOutside)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('SwissGeoElevationProfile', SwissGeoElevationProfile)

app.mount('#app')
