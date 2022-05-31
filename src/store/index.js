import { createStore } from 'vuex'

import app from './modules/app.store'
import drawing from './modules/drawing.store'
import features from './modules/features.store'
import geolocation from './modules/geolocation.store'
import i18n from './modules/i18n.store'
import layers from './modules/layers.store'
import map from './modules/map.store'
import position from './modules/position.store'
import search from './modules/search.store'
import topics from './modules/topics.store'
import ui from './modules/ui.store'

import loadLayersConfigOnLangChange from './plugins/load-layersconfig-on-lang-change'
import redoSearchOnLangChange from './plugins/redo-search-on-lang-change.plugin'
import menuSearchBarInteractionManagementPlugin from './plugins/menu-search-interaction.plugin'
import clickOnMapManagementPlugin from './plugins/click-on-map-management.plugin'
import appReadinessPlugin from './plugins/app-readiness.plugin'
import geolocationManagementPlugin from './plugins/geolocation-management.plugin'
import topicChangeManagementPlugin from './plugins/topic-change-management.plugin'
import loadingBarManagementPlugin from './plugins/loading-bar-management.plugin'
import drawingLayerManagementPlugin from './plugins/drawing-layer-management.plugin'
import screenSizeManagementPlugin from './plugins/screen-size-management.plugin'

export default createStore({
    strict: true,
    state: {},
    plugins: [
        loadLayersConfigOnLangChange,
        redoSearchOnLangChange,
        menuSearchBarInteractionManagementPlugin,
        clickOnMapManagementPlugin,
        appReadinessPlugin,
        geolocationManagementPlugin,
        topicChangeManagementPlugin,
        loadingBarManagementPlugin,
        drawingLayerManagementPlugin,
        screenSizeManagementPlugin,
    ],
    modules: {
        app,
        drawing,
        features,
        geolocation,
        i18n,
        layers,
        map,
        position,
        search,
        topics,
        ui,
    },
})
