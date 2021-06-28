import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app.store'
import layers from './modules/layers.store'
import geolocation from './modules/geolocation.store'
import position from './modules/position.store'
import topics from './modules/topics.store'
import ui from './modules/ui.store'
import drawing from './modules/drawing.store'

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
import topicChangeManagementPlugin from '@/modules/store/plugins/topic-change-management.plugin'
import loadingBarManagementPlugin from '@/modules/store/plugins/loading-bar-management.plugin'
import drawingOverlayAndMenuManagementPlugin from '@/modules/store/plugins/drawing-overlay-menu-management.plugin'
import drawingAddLayerWhenDrawingDonePlugin from '@/modules/store/plugins/drawing-add-layer-when-drawing-done.plugin'

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
        topicChangeManagementPlugin,
        loadingBarManagementPlugin,
        drawingOverlayAndMenuManagementPlugin,
        drawingAddLayerWhenDrawingDonePlugin,
    ],
    modules: {
        app,
        layers,
        topics,
        geolocation,
        position,
        ui,
        drawing,
        map,
        overlay,
        search,
        i18n,
    },
})
