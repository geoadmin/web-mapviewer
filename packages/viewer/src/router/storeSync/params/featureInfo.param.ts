import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { UIStoreActions } from '@/store/actions'
import useUIStore, { FeatureInfoPositions } from '@/store/modules/ui'
import { isEnumValue } from '@/utils/utils'

function parseFeatureInfoPosition(urlParamValue?: string): FeatureInfoPositions | undefined {
    if (!urlParamValue) {
        return undefined
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.DEFAULT, urlParamValue)) {
        return FeatureInfoPositions.DEFAULT
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.TOOLTIP, urlParamValue)) {
        return FeatureInfoPositions.TOOLTIP
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.BOTTOMPANEL, urlParamValue)) {
        return FeatureInfoPositions.BOTTOMPANEL
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.NONE, urlParamValue)) {
        return FeatureInfoPositions.NONE
    }
    return undefined
}

const featureInfoParamConfig = new UrlParamConfig<string>({
    urlParamName: 'featureInfo',
    actionsToWatch: [UIStoreActions.SetFeatureInfoPosition],
    extractValueFromStore: () => useUIStore().featureInfoPosition,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        const position = parseFeatureInfoPosition(urlParamValue)
        if (position) {
            useUIStore().setFeatureInfoPosition(position, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: false,
    valueType: String,
    defaultValue: FeatureInfoPositions.NONE,
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(
            queryValue,
            parseFeatureInfoPosition(queryValue) !== undefined,
            'featureInfo'
        ),
})

export default featureInfoParamConfig
