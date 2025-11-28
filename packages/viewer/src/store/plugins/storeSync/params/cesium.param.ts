import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useCesiumStore from '@/store/modules/cesium'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

const cesiumParamConfig = new UrlParamConfig<boolean>({
    urlParamName: '3d',
    actionsToWatch: ['set3dActive'],
    extractValueFromStore: () => useCesiumStore().active,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, queryValue?: boolean) => {
        const cesiumStore = useCesiumStore()
        if (typeof queryValue === 'boolean') {
            cesiumStore.set3dActive(queryValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else if (cesiumStore.active) {
            cesiumStore.set3dActive(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
})

export default cesiumParamConfig
