import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { EMBED_VIEW } from '@/router/viewNames'
import useUIStore from '@/store/modules/ui'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

const noSimpleZoomParamConfig = new UrlParamConfig<boolean>({
    urlParamName: 'noSimpleZoom',
    actionsToWatch: ['setNoSimpleZoomEmbed'],
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
