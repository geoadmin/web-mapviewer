import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { URL_PARAM_NAME_SWISSSEARCH } from '@/router/storeSync/params/swisssearch.param'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import useSearchStore from '@/store/modules/search'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

const URL_PARAM_NAME = 'swisssearch_autoselect'

const swisssearchAutoSelectParam = new UrlParamConfig<boolean>({
    urlParamName: URL_PARAM_NAME,
    actionsToWatch: ['setAutoSelect'],
    setValuesInStore: (to: RouteLocationNormalizedGeneric, urlParamValue?: boolean) => {
        const searchStore = useSearchStore()
        // avoiding setting the swisssearch autoselect to the store when there is nothing to autoselect because there is no swisssearch query
        if (typeof urlParamValue === 'boolean') {
            if (to.query[URL_PARAM_NAME_SWISSSEARCH]) {
                searchStore.setAutoSelect(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
            }
        } else if (searchStore.autoSelect) {
            searchStore.setAutoSelect(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME),
    extractValueFromStore: () => useSearchStore().autoSelect,
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
})

export default swisssearchAutoSelectParam
