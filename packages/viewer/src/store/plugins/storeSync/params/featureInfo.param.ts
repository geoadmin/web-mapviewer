import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'
import { isEnumValue } from '@/utils/utils'

function parseFeatureInfoPosition(urlParamValue?: string): FeatureInfoPositions | undefined {
    if (!urlParamValue) {
        return undefined
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.Default, urlParamValue)) {
        return FeatureInfoPositions.Default
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.ToolTip, urlParamValue)) {
        return FeatureInfoPositions.ToolTip
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.BottomPanel, urlParamValue)) {
        return FeatureInfoPositions.BottomPanel
    }
    if (isEnumValue<FeatureInfoPositions>(FeatureInfoPositions.None, urlParamValue)) {
        return FeatureInfoPositions.None
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
    defaultValue: FeatureInfoPositions.None,
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(
            queryValue,
            parseFeatureInfoPosition(queryValue) !== undefined,
            'featureInfo'
        ),
})

export default featureInfoParamConfig
