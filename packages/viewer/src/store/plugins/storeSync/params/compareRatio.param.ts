import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useUIStore from '@/store/modules/ui'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

function dispatchCompareSliderFromUrlParam(
    _: RouteLocationNormalizedGeneric,
    urlParamValue?: number
) {
    if (urlParamValue) {
        const uiStore = useUIStore()

        uiStore.setCompareRatio(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        // small check here: if the user is inserting a non valid value, we won't activate the slider
        if (urlParamValue > 0.0 && urlParamValue < 1.0) {
            uiStore.setCompareSliderActive(true, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    }
}

function generateCompareSliderUrlParamFromStore(): number | undefined {
    const uiStore = useUIStore()
    if (!!uiStore.compareRatio && uiStore.isCompareSliderActive) {
        return uiStore.compareRatio
    }
    return
}

const compareRationParamConfig = new UrlParamConfig<number>({
    urlParamName: 'compareRatio',
    actionsToWatch: ['setCompareRatio', 'setCompareSliderActive'],
    setValuesInStore: dispatchCompareSliderFromUrlParam,
    extractValueFromStore: generateCompareSliderUrlParamFromStore,
    keepInUrlWhenDefault: false,
    valueType: Number,
    validateUrlInput: (queryValue?: number) =>
        getDefaultValidationResponse(
            queryValue,
            !!queryValue && queryValue <= 1.0 && queryValue >= 0.0,
            'compareRatio'
        ),
})

export default compareRationParamConfig
