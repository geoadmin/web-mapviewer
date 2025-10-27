import { createPinia } from 'pinia'

import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'

const pinia = createPinia()
pinia.use(storeActionLogPlugin)

export default pinia
