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
    // Always return default value so this param never gets re-added to URL by storeToUrl plugin
    extractValueFromStore: () => '',
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        if (urlParamValue) {
            void useSearchStore().setSearchQuery(
                urlParamValue,
                { originUrlParam: true },
                STORE_DISPATCHER_ROUTER_PLUGIN
            )
        }
    },
    afterSetValuesInStore: () => {
        // Defer removal to next event loop tick to ensure all URL params are processed
        // and router state is stable before manually modifying the URL
        setTimeout(() => removeQueryParamFromHref(URL_PARAM_NAME_SWISSSEARCH), 0)
    },
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: '',
})

export default swisssearchParamConfig
