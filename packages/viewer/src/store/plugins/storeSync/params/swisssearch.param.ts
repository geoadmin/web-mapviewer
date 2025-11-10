import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useSearchStore from '@/store/modules/search'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

export const URL_PARAM_NAME_SWISSSEARCH: string = 'swisssearch'

const swisssearchParamConfig = new UrlParamConfig<string>({
    urlParamName: URL_PARAM_NAME_SWISSSEARCH,
    // no mutation to watch, we only react to this param if it is there at app start-up
    actionsToWatch: [],
    extractValueFromStore: () => useSearchStore().query,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        if (urlParamValue) {
            useSearchStore().setSearchQuery(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME_SWISSSEARCH),
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: '',
})

export default swisssearchParamConfig
