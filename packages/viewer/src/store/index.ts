import { createPinia } from 'pinia'

import reprojectPlugin from '@/store/plugins/reproject.plugin'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import registerSyncCameraLonLatZoom from '@/store/plugins/sync-camera-lonlatzoom'
import topicChangeManagement from '@/store/plugins/topic-change-management.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'

const pinia = createPinia()
pinia.use(reprojectPlugin)
pinia.use(topicChangeManagement)
pinia.use(updateSelectedFeatures)
pinia.use(storeActionLogPlugin)
pinia.use(registerSyncCameraLonLatZoom)

export default pinia
