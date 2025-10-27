import { createPinia } from 'pinia'

import reprojectPlugin from '@/store/plugins/reproject.plugin'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'

const pinia = createPinia()
pinia.use(reprojectPlugin)
pinia.use(updateSelectedFeatures)
pinia.use(storeActionLogPlugin)

export default pinia
