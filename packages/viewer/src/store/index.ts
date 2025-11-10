import { createPinia } from 'pinia'
import { markRaw } from 'vue'

import router from '@/router'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import storeSyncRouterPlugin from '@/store/plugins/storeSync'

const pinia = createPinia()
pinia.use(({ store }) => {
    store.router = markRaw(router)
})
pinia.use(storeActionLogPlugin)
pinia.use(storeSyncRouterPlugin)

export default pinia
