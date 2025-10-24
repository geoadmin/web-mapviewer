import { createPinia } from 'pinia'

import loadExternalLayerAttributes from '@/store/plugins/external-layers.plugin'
import legacyPermalinkPlugin from '@/store/plugins/legacy-permalink.plugin'
import loadGpxDataAndMetadata from '@/store/plugins/load-gpx-data.plugin'
import loadKmlDataAndMetadata from '@/store/plugins/load-kml-kmz-data.plugin'
import reprojectPlugin from '@/store/plugins/reproject.plugin'
import screenSizeManagement from '@/store/plugins/screen-size-management.plugin'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import registerSyncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagement from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'

const pinia = createPinia()
pinia.use(legacyPermalinkPlugin)
pinia.use(loadExternalLayerAttributes)
pinia.use(loadGpxDataAndMetadata)
pinia.use(loadKmlDataAndMetadata)
pinia.use(reprojectPlugin)
pinia.use(screenSizeManagement)
pinia.use(topicChangeManagement)
pinia.use(updateSelectedFeatures)
pinia.use(storeActionLogPlugin)
pinia.use(registerSyncCameraLonLatZoom)

export default pinia
