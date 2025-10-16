import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { EMBED_VIEW } from '@/router/viewNames'
import useUIStore, { UIStoreActions } from '@/store/modules/ui.store'

const noSimpleZoomParamConfig = new UrlParamConfig<boolean>({
    urlParamName: 'noSimpleZoom',
    actionsToWatch: [UIStoreActions.SetNoSimpleZoomEmbed],
    setValuesInStore: (to: RouteLocationNormalizedGeneric, queryValue?: boolean) => {
        const uiStore = useUIStore()
        if (typeof queryValue === 'boolean' && to.name === EMBED_VIEW) {
            uiStore.setNoSimpleZoomEmbed(queryValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else if (uiStore.noSimpleZoomEmbed) {
            uiStore.setNoSimpleZoomEmbed(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    extractValueFromStore: () => useUIStore().noSimpleZoomEmbed,
    keepInUrlWhenDefault: false,
    valueType: Boolean,
})

export default noSimpleZoomParamConfig
