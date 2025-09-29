import { createPinia } from 'pinia'

import from2Dto3DPlugin from '@/store/plugins/2d-to-3d.plugin'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin'
import clickOnMapPlugin from '@/store/plugins/click-on-map.plugin'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import geolocationManagement from '@/store/plugins/geolocation.plugin'
import loadCOGMetadataPlugin from '@/store/plugins/load-cog-metadata.plugin'
import loadGeojsonStyleAndData from '@/store/plugins/load-geojson-style-and-data.plugin.ts'
import loadGpxDataAndMetadata from '@/store/plugins/load-gpx-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-kmz-data.plugin'
import layersConfigPlugin from '@/store/plugins/layers-config.plugin'
import redoSearchWhenNeeded from '@/store/plugins/redo-search-when-needed.plugin'
import reprojectPlugin from '@/store/plugins/reproject.plugin.ts'
import screenSizeManagement from '@/store/plugins/screen-size-management.plugin'
import topicChangeManagement from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'
import vuexLogPlugin from '@/store/plugins/vuex-log.plugin'

import registerSyncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'

const pinia = createPinia()
pinia.use(appReadinessPlugin)
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
pinia.use(vuexLogPlugin)
pinia.use(registerSyncCameraLonLatZoom)

export default pinia
