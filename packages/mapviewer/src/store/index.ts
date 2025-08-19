import { createPinia } from 'pinia'

import from2Dto3Dplugin from '@/store/plugins/2d-to-3d.plugin.ts'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin'
import clickOnMapPlugin from '@/store/plugins/click-on-map.plugin.ts'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin.ts'
import geolocationManagementPlugin from '@/store/plugins/geolocation-management.plugin'
import legacyPermalinkManagementRouterPlugin from '@/store/plugins/legacy-permalink.plugin'
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
pinia.use(from2Dto3Dplugin)
pinia.use(appReadinessPlugin)
pinia.use(clickOnMapPlugin)
pinia.use(legacyPermalinkManagementRouterPlugin)

// vuexLogPlugin,
// loadLayersConfigOnLangChange,
// redoSearchWhenNeeded,
// geolocationManagementPlugin,
// topicChangeManagementPlugin,
// screenSizeManagementPlugin,
// syncCameraLonLatZoom,
// reprojectLayersOnProjectionChangePlugin,
// loadExternalLayerAttributes,
// loadGeojsonStyleAndData,
// loadKmlDataAndMetadata,
// loadGpxDataAndMetadata,
// loadCOGMetadata,
// updateSelectedFeaturesPlugin,

export default pinia
