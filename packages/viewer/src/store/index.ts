import { createPinia } from 'pinia'

import from2Dto3DPlugin from '@/store/plugins/2d-to-3d.plugin'
import appReadinessPlugin from '@/store/plugins/app-readiness.plugin'
import clickOnMapPlugin from '@/store/plugins/click-on-map.plugin'
import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import geolocationManagementPlugin from '@/store/plugins/geolocation.plugin'
import loadCOGMetadataPlugin from '@/store/plugins/load-cog-metadata.plugin'
import loadGeojsonStyleAndData from '@/store/plugins/load-geojson-style-and-data.plugin.ts'
import loadGpxDataAndMetadata from '@/store/plugins/load-gpx-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-kmz-data.plugin'
import layersConfigPlugin from '@/store/plugins/layers-config.plugin'
import redoSearchWhenNeeded from '@/store/plugins/redo-search-when-needed.plugin'
import reprojectPlugin from '@/store/plugins/reproject.plugin.ts'
import screenSizeManagementPlugin from '@/store/plugins/screen-size-management.plugin'
import syncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagementPlugin from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeaturesPlugin from '@/store/plugins/update-selected-features.plugin'
import vuexLogPlugin from '@/store/plugins/vuex-log.plugin'

const pinia = createPinia()
pinia.use(appReadinessPlugin)
pinia.use(from2Dto3DPlugin)
pinia.use(clickOnMapPlugin)
pinia.use(loadExternalLayerAttributes)
pinia.use(geolocationManagementPlugin)
pinia.use(loadCOGMetadataPlugin)
pinia.use(loadGeojsonStyleAndData)
pinia.use(loadGpxDataAndMetadata)
pinia.use(loadKmlDataAndMetadata)
pinia.use(layersConfigPlugin)
pinia.use(redoSearchWhenNeeded)
pinia.use(reprojectPlugin)
pinia.use(screenSizeManagementPlugin)
pinia.use(syncCameraLonLatZoom)
pinia.use(topicChangeManagementPlugin)
pinia.use(updateSelectedFeaturesPlugin)
pinia.use(vuexLogPlugin)

export default pinia
