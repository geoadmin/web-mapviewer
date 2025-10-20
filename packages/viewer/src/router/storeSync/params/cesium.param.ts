import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { CesiumStoreActions } from '@/store/actions'
import useCesiumStore from '@/store/modules/cesium.store'

const cesiumParamConfig = new UrlParamConfig<boolean>({
    urlParamName: '3d',
    actionsToWatch: [CesiumStoreActions.Set3dActive],
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
