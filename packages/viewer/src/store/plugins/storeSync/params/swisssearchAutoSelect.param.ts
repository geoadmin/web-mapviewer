import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useSearchStore from '@/store/modules/search'
import { URL_PARAM_NAME_SWISSSEARCH } from '@/store/plugins/storeSync/params/swisssearch.param'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

const URL_PARAM_NAME = 'swisssearch_autoselect'

const swisssearchAutoSelectParam = new UrlParamConfig<boolean>({
    urlParamName: URL_PARAM_NAME,
    actionsToWatch: ['setAutoSelect'],
    setValuesInStore: (to: RouteLocationNormalizedGeneric, urlParamValue?: boolean) => {
        console.log(
            '[swisssearchAutoSelectParam] setValuesInStore swisssearchAutoSelectParam',
            urlParamValue
        )
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
    afterSetValuesInStore: () => {
        console.log('[swisssearchAutoSelectParam] afterSetValuesInStore swisssearchAutoSelectParam')
        // Defer removal to next event loop tick to ensure all URL params are processed
        // and router state is stable before manually modifying the URL
        setTimeout(() => removeQueryParamFromHref(URL_PARAM_NAME), 0)
    },
    // Always return default value so this param never gets re-added to URL by storeToUrl plugin
    extractValueFromStore: () => false,
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
})

export default swisssearchAutoSelectParam
