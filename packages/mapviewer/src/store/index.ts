import { createPinia } from 'pinia'
import { createStore } from 'vuex'

import type { State } from '@/store/store'

import { ENVIRONMENT } from '@/config/staging.config'
import cesium from '@/store/modules/cesium.store.ts'
import debug from '@/store/modules/debug.store.ts'
import drawing from '@/store/modules/drawing.store.ts'
import features from '@/store/modules/features.store.ts'
import geolocation from '@/store/modules/geolocation.store.ts'
import i18n from '@/store/modules/i18n.store.ts'
import layers from '@/store/modules/layers.store.ts'
import map from '@/store/modules/map.store.ts'
import position from '@/store/modules/position.store.ts'
import print from '@/store/modules/print.store.ts'
import profile from '@/store/modules/profile.store.ts'
import search from '@/store/modules/search.store.ts'
import share from '@/store/modules/share.store'
import topics from '@/store/modules/topics.store.ts'
import ui from '@/store/modules/ui.store'
import from2Dto3Dplugin from '@/store/plugins/2d-to-3d-management.plugin'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin.ts'
import clickOnMapManagementPlugin from '@/store/plugins/click-on-map-management.plugin'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import geolocationManagementPlugin from '@/store/plugins/geolocation-management.plugin'
import loadCOGMetadata from '@/store/plugins/load-cog-metadata.plugin'
import loadGeojsonStyleAndData from '@/store/plugins/load-geojson-style-and-data.plugin'
import loadGpxDataAndMetadata from '@/store/plugins/load-gpx-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-kmz-data.plugin'
import loadLayersConfigOnLangChange from '@/store/plugins/load-layersconfig-on-lang-change'
import redoSearchWhenNeeded from '@/store/plugins/redo-search-when-needed.plugin'
import reprojectLayersOnProjectionChangePlugin from '@/store/plugins/reproject-layers-on-projection-change.plugin'
import screenSizeManagementPlugin from '@/store/plugins/screen-size-management.plugin'
import syncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagementPlugin from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeaturesPlugin from '@/store/plugins/update-selected-features.plugin'
import vuexLogPlugin from '@/store/plugins/vuex-log.plugin'

const pinia = createPinia()
pinia.use(appReadinessPlugin)

const store = createStore<State>({
    // Do not run strict mode on production has it has performance cost
    strict: ENVIRONMENT !== 'production',
    state: {},
    plugins: [
        vuexLogPlugin,
        loadLayersConfigOnLangChange,
        redoSearchWhenNeeded,
        clickOnMapManagementPlugin,
        appReadinessPlugin,
        geolocationManagementPlugin,
        topicChangeManagementPlugin,
        screenSizeManagementPlugin,
        syncCameraLonLatZoom,
        reprojectLayersOnProjectionChangePlugin,
        from2Dto3Dplugin,
        loadExternalLayerAttributes,
        loadGeojsonStyleAndData,
        loadKmlDataAndMetadata,
        loadGpxDataAndMetadata,
        loadCOGMetadata,
        updateSelectedFeaturesPlugin,
    ],
    modules: {
        drawing,
        features,
        profile,
        geolocation,
        i18n,
        map,
        position,
        search,
        topics,
        ui,
        share,
        cesium,
        print,
        debug,
    },
})

export default pinia
