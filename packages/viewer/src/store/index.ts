import { createPinia } from 'pinia'

import storeSyncRouterPlugin from '@/router/storeSync'
import from2Dto3DPlugin from '@/store/plugins/2d-to-3d.plugin'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin'
import clickOnMapPlugin from '@/store/plugins/click-on-map.plugin'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import geolocationManagement from '@/store/plugins/geolocation.plugin'
import layersConfigPlugin from '@/store/plugins/layers-config.plugin'
import legacyPermalinkPlugin from '@/store/plugins/legacy-permalink.plugin'
import loadCOGMetadataPlugin from '@/store/plugins/load-cog-metadata.plugin'
import loadGeojsonStyleAndData from '@/store/plugins/load-geojson-style-and-data.plugin'
import loadGpxDataAndMetadata from '@/store/plugins/load-gpx-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-kmz-data.plugin'
import redoSearchWhenNeeded from '@/store/plugins/redo-search-when-needed.plugin'
import reprojectPlugin from '@/store/plugins/reproject.plugin'
import screenSizeManagement from '@/store/plugins/screen-size-management.plugin'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import registerSyncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagement from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'
import vuexLogPlugin from '@/store/plugins/vuex-log.plugin'

const pinia = createPinia()
pinia.use(appReadinessPlugin)
pinia.use(legacyPermalinkPlugin)
pinia.use(from2Dto3DPlugin)
pinia.use(clickOnMapPlugin)
pinia.use(loadExternalLayerAttributes)
pinia.use(geolocationManagement)
pinia.use(loadCOGMetadataPlugin)
pinia.use(loadGeojsonStyleAndData)
pinia.use(loadGpxDataAndMetadata)
pinia.use(loadKmlDataAndMetadata)
pinia.use(layersConfigPlugin)
pinia.use(redoSearchWhenNeeded)
pinia.use(reprojectPlugin)
pinia.use(screenSizeManagement)
pinia.use(topicChangeManagement)
pinia.use(updateSelectedFeatures)
pinia.use(storeActionLogPlugin)
pinia.use(registerSyncCameraLonLatZoom)
pinia.use(storeSyncRouterPlugin)

export default pinia
