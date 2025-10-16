import type { RouteLocationNormalizedGeneric } from 'vue-router'

import log from '@swissgeo/log'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import useSearchStore from '@/store/modules/search.store'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

export const URL_PARAM_NAME_SWISSSEARCH: string = 'swisssearch'

const swisssearchParamConfig = new UrlParamConfig<string>({
    urlParamName: URL_PARAM_NAME_SWISSSEARCH,
    // no mutation to watch, we only react to this param if it is there at app start-up
    actionsToWatch: [],
    extractValueFromStore: () => useSearchStore().query,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        if (urlParamValue) {
            useSearchStore()
                .setSearchQuery({ query: urlParamValue }, STORE_DISPATCHER_ROUTER_PLUGIN)
                .catch((error) => {
                    log.error({
                        title: 'swisssearch URL param',
                        messages: ['Failed to set search query from URL param', error],
                    })
                })
        }
    },
    afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME_SWISSSEARCH),
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: '',
})

export default swisssearchParamConfig
