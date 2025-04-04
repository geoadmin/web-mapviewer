import { timeConfigUtils } from '@geoadmin/layers/utils'
import { WarningMessage } from '@geoadmin/log/Message'

import { getStandardValidationResponse } from '@/api/errorQueues.api'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
function dispatchTimeSliderFromUrlParam(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    const isValidYear =
        urlParamValue &&
        !isNaN(urlParamValue) &&
        Number.isInteger(urlParamValue) &&
        store.getters.oldestYear <= urlParamValue &&
        store.getters.youngestYear >= urlParamValue

    // In case the timeSlider param is set to a string urlParamValue will be null so we set the value also to null
    if (urlParamValue === null || isValidYear) {
        promisesForAllDispatch.push(
            store.dispatch('setPreviewYear', {
                year: urlParamValue,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
        if (store.getters.visibleLayers.some(layer => timeConfigUtils.hasMultipleTimestamps(layer))) {
            promisesForAllDispatch.push(
                store.dispatch('setTimeSliderActive', {
                    timeSliderActive: true,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            )
        }
    }
    return Promise.all(promisesForAllDispatch)
}

function generateTimeSliderUrlParamFromStore(store) {
    return store.state.ui.isTimeSliderActive ? store.state.layers.previewYear : null
}

function validateUrlInput(store, query) {
    const validationObject = getStandardValidationResponse(
        query,
        !isNaN(query) &&
            Number.isInteger(Number(query)) &&
            store.getters.oldestYear <= query &&
            store.getters.youngestYear >= query,
        this.urlParamName
    )

    if (
        store.getters.visibleLayers.filter((layer) => timeConfigUtils.hasMultipleTimestamps(layer))
            .length === 0
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

/**
 * When the timeSlider parameter is set in the URL, if the year is a valid year, it will set the
 * timeSlider to active to the correct year. The parameter only appears if the time Slider is
 * active
 */
export default class TimeSliderParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'timeSlider',
            mutationsToWatch: ['setPreviewYear', 'setTimeSliderActive'],
            setValuesInStore: dispatchTimeSliderFromUrlParam,
            extractValueFromStore: generateTimeSliderUrlParamFromStore,
            keepInUrlWhenDefault: false,
            valueType: Number,
            defaultValue: null,
            validateUrlInput: validateUrlInput,
        })
    }
}
