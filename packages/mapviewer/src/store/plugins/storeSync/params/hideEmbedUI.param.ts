import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useUIStore from '@/store/modules/ui'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

const hideEmbedUIParam = new UrlParamConfig<boolean>({
    urlParamName: 'hideEmbedUI',
    actionsToWatch: ['setHideEmbedUI'],
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: boolean) => {
        const uiStore = useUIStore()
        if (typeof urlParamValue === 'boolean') {
            uiStore.setHideEmbedUI(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else if (uiStore.hideEmbedUI) {
            uiStore.setHideEmbedUI(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    extractValueFromStore: () => {
        return useUIStore().hideEmbedUI
    },
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
})

export default hideEmbedUIParam
