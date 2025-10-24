import { createPinia } from 'pinia'

import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import updateSelectedFeatures from '@/store/plugins/update-selected-features.plugin'

const pinia = createPinia()

pinia.use(updateSelectedFeatures)
pinia.use(storeActionLogPlugin)

export default pinia
