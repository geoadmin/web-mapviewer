import { createStore } from 'vuex'

import app from './modules/app.store'
import layers from './modules/layers.store'
import geolocation from './modules/geolocation.store'
import position from './modules/position.store'
import topics from './modules/topics.store'
import ui from './modules/ui.store'
import drawing from './modules/drawing.store'

import map from '@/modules/map/store'
import search from '@/modules/menu/store'
import i18n from '@/modules/i18n/store'

import loadLayersConfigOnLangChange from './plugins/load-layersconfig-on-lang-change'
import redoSearchOnLangChange from './plugins/redo-search-on-lang-change.plugin'
import menuSearchBarInteractionManagementPlugin from './plugins/menu-search-interaction.plugin'
import clickOnMapManagementPlugin from './plugins/click-on-map-management.plugin'
import appReadinessPlugin from './plugins/app-readiness.plugin'
import geolocationManagementPlugin from './plugins/geolocation-management.plugin'
import topicChangeManagementPlugin from '@/modules/store/plugins/topic-change-management.plugin'
import loadingBarManagementPlugin from '@/modules/store/plugins/loading-bar-management.plugin'
import drawingLayerManagementPlugin from '@/modules/store/plugins/drawing-layer-management.plugin'
import screenSizeManagementPlugin from '@/modules/store/plugins/screen-size-management.plugin'

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
        layers,
        topics,
        geolocation,
        position,
        ui,
        drawing,
        map,
        search,
        i18n,
    },
})
