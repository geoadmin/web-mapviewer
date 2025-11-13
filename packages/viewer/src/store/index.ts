import { createPinia } from 'pinia'

import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import storeSyncRouterPlugin from '@/store/plugins/storeSync'

const pinia = createPinia()
pinia.use(storeActionLogPlugin)
pinia.use(storeSyncRouterPlugin)

export default pinia
