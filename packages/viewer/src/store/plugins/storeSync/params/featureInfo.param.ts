import type { RouteLocationNormalizedGeneric } from 'vue-router'

import type { FeatureInfoPosition } from '@/store/modules/ui/types'

import useUIStore from '@/store/modules/ui'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

function parseFeatureInfoPosition(urlParamValue?: string): FeatureInfoPosition | undefined {
    if (!urlParamValue) {
        return undefined
    }
    if (['default', 'tooltip', 'bottompanel', 'none'].includes(urlParamValue.toLowerCase())) {
        return urlParamValue.toLowerCase() as FeatureInfoPosition
    }
    return undefined
}

const featureInfoParamConfig = new UrlParamConfig<string>({
    urlParamName: 'featureInfo',
    actionsToWatch: ['setFeatureInfoPosition'],
    extractValueFromStore: () => useUIStore().featureInfoPosition,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        const position = parseFeatureInfoPosition(urlParamValue)
        if (position) {
            useUIStore().setFeatureInfoPosition(position, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: 'none',
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(
            queryValue,
            parseFeatureInfoPosition(queryValue) !== undefined,
            'featureInfo'
        ),
})

export default featureInfoParamConfig
