import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { UIStoreActions } from '@/store/actions'
import useUIStore from '@/store/modules/ui.store'

const hideEmbedUIParam = new UrlParamConfig<boolean>({
    urlParamName: 'hideEmbedUI',
    actionsToWatch: [UIStoreActions.SetHideEmbedUI],
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
