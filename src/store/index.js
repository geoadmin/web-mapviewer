import { createStore } from 'vuex'

import app from '@/store/modules/app.store'
import cesium from '@/store/modules/cesium.store'
import drawing from '@/store/modules/drawing.store'
import features from '@/store/modules/features.store'
import geolocation from '@/store/modules/geolocation.store'
import i18n from '@/store/modules/i18n.store'
import layers from '@/store/modules/layers.store'
import map from '@/store/modules/map.store'
import position from '@/store/modules/position.store'
import search from '@/store/modules/search.store'
import share from '@/store/modules/share.store'
import topics from '@/store/modules/topics.store'
import ui from '@/store/modules/ui.store'
import from2Dto3Dplugin from '@/store/plugins/2d-to-3d-management.plugin'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin'
import clickOnMapManagementPlugin from '@/store/plugins/click-on-map-management.plugin'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import geolocationManagementPlugin from '@/store/plugins/geolocation-management.plugin'
import loadGeojsonStyleAndData from '@/store/plugins/load-geojson-style-and-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-data.plugin'
import loadLayersConfigOnLangChange from '@/store/plugins/load-layersconfig-on-lang-change'
import loadingBarManagementPlugin from '@/store/plugins/loading-bar-management.plugin'
import menuSearchBarInteractionManagementPlugin from '@/store/plugins/menu-search-interaction.plugin'
import redoSearchOnLangChange from '@/store/plugins/redo-search-on-lang-change.plugin'
import reprojectSelectedFeaturesOnProjectionChangePlugin from '@/store/plugins/reproject-selected-features-on-projection-change.plugin'
import screenSizeManagementPlugin from '@/store/plugins/screen-size-management.plugin'
import syncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagementPlugin from '@/store/plugins/topic-change-management.plugin'

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
        screenSizeManagementPlugin,
        syncCameraLonLatZoom,
        reprojectSelectedFeaturesOnProjectionChangePlugin,
        from2Dto3Dplugin,
        loadExternalLayerAttributes,
        loadGeojsonStyleAndData,
        loadKmlDataAndMetadata,
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
        share,
        cesium,
    },
})
