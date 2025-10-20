import type { Layer } from '@swissgeo/layers'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { timeConfigUtils } from '@swissgeo/layers/utils'
import { WarningMessage } from '@swissgeo/log/Message'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import {
    getDefaultValidationResponse,
    type ValidationResponse,
} from '@/router/storeSync/validation.ts'
import { LayerStoreActions, UIStoreActions } from '@/store/actions'
import useLayersStore from '@/store/modules/layers.store'
import useUIStore from '@/store/modules/ui.store'

function isValidYear(year?: number): boolean {
    const layersStore = useLayersStore()
    return !!year && layersStore.oldestYear <= year && layersStore.youngestYear >= year
}

function setValuesInStore(_: RouteLocationNormalizedGeneric, urlParamValue?: number) {
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    // In case the timeSlider param is set to a string urlParamValue will be null so we set the value also to null
    if (urlParamValue === undefined || isValidYear(urlParamValue)) {
        layersStore.setPreviewYear(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)

        if (
            layersStore.visibleLayers.some((layer: Layer) =>
                timeConfigUtils.hasMultipleTimestamps(layer)
            )
        ) {
            uiStore.setTimeSliderActive(true, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    }
}

function validateUrlInput(queryValue?: number): ValidationResponse {
    const validationObject = getDefaultValidationResponse(
        queryValue,
        isValidYear(queryValue),
        'timeSlider'
    )

    const layersStore = useLayersStore()
    if (
        layersStore.visibleLayers.some((layer: Layer) =>
            timeConfigUtils.hasMultipleTimestamps(layer)
        )
    ) {
        if (!validationObject.warnings) {
            validationObject.warnings = []
        }
        validationObject.warnings.push(
            new WarningMessage('time_slider_no_time_layer_active_url_warning', {})
        )
    }
    return validationObject
}

const timeSliderParamConfig = new UrlParamConfig<number>({
    urlParamName: 'timeSlider',
    actionsToWatch: [LayerStoreActions.SetPreviewLayer, UIStoreActions.SetTimeSliderActive],
    setValuesInStore,
    extractValueFromStore: () => {
        const uiStore = useUIStore()
        const layersStore = useLayersStore()
        if (uiStore.isTimeSliderActive) {
            return layersStore.previewYear
        }
        return undefined
    },
    keepInUrlWhenDefault: false,
    valueType: Number,
    validateUrlInput,
})

export default timeSliderParamConfig
