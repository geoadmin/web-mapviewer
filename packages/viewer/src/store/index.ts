import { createPinia } from 'pinia'
import { markRaw } from 'vue'

import router from '@/router'
import stateMachinePlugin from '@/store/plugins/stateMachine.plugin'
import storeActionLogPlugin from '@/store/plugins/store-action-log.plugin'
import storeToUrlPlugin from '@/store/plugins/storeSync/storeToUrl.plugin'
import urlToStorePlugin from '@/store/plugins/storeSync/urlToStore.plugin'

const pinia = createPinia()
pinia.use(({ store }) => {
    store.router = markRaw(router)
})
pinia.use(storeActionLogPlugin)
pinia.use(urlToStorePlugin)
pinia.use(storeToUrlPlugin)
pinia.use(stateMachinePlugin)

export default pinia
