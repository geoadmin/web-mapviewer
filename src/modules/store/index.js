import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app.store'
import layers from './modules/layers.store'
import geolocation from './modules/geolocation.store'
import position from './modules/position.store'
import ui from './modules/ui.store'

import map from '../map/store'
import overlay from '../overlay/store'
import search from '../search/store'
import i18n from '../i18n/store'

import loadLayersConfigOnLangChange from './plugins/load-layersconfig-on-lang-change'
import redoSearchOnLangChange from './plugins/redo-search-on-lang-change.plugin'
import menuSearchBarAndOverlayInteractionManagementPlugin from './plugins/menu-search-overlay-interaction.plugin'
import clickOnMapManagementPlugin from './plugins/click-on-map-management.plugin'
import appReadinessPlugin from './plugins/app-readiness.plugin'
import geolocationManagementPlugin from './plugins/geolocation-management.plugin'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: true,
    plugins: [
        loadLayersConfigOnLangChange,
        redoSearchOnLangChange,
        menuSearchBarAndOverlayInteractionManagementPlugin,
        clickOnMapManagementPlugin,
        appReadinessPlugin,
        geolocationManagementPlugin,
    ],
    modules: {
        app,
        layers,
        geolocation,
        position,
        ui,
        map,
        overlay,
        search,
        i18n,
    },
})
