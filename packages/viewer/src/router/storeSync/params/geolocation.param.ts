import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { GeolocationStoreActions } from '@/store/actions'
import useGeolocationStore from '@/store/modules/geolocation.store'

const geolocationParamConfig = new UrlParamConfig<boolean>({
    urlParamName: 'geolocation',
    actionsToWatch: [GeolocationStoreActions.SetGeolocationActive],
    extractValueFromStore: () => useGeolocationStore().active,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, queryValue?: boolean) => {
        const geolocationStore = useGeolocationStore()
        if (typeof queryValue === 'boolean') {
            geolocationStore.setGeolocationActive(queryValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else if (geolocationStore.active) {
            geolocationStore.setGeolocationActive(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
})

export default geolocationParamConfig
