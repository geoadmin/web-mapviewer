import { OLDEST_YEAR, YOUNGEST_YEAR } from '@/config/time.config'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import ErrorMessage from '@/utils/ErrorMessage.class'

function dispatchTimeSliderFromUrlParam(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    if (
        urlParamValue &&
        !isNaN(urlParamValue) &&
        Number.isInteger(urlParamValue) &&
        OLDEST_YEAR <= urlParamValue &&
        YOUNGEST_YEAR >= urlParamValue
    ) {
        promisesForAllDispatch.push(
            store.dispatch('setPreviewYear', {
                year: urlParamValue,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
        // if there are no time enabled layers amongst visible layers, we don't activate the timeSlider
        if (store.getters.visibleLayers.filter((layer) => layer.hasMultipleTimestamps).length > 0) {
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

function acceptedValues(store, query) {
    if (
        query &&
        !isNaN(query) &&
        Number.isInteger(query) &&
        OLDEST_YEAR <= query &&
        YOUNGEST_YEAR >= query &&
        store.getters.visibleLayers.filter((layer) => layer.hasMultipleTimestamps).length === 0
    ) {
        // we add a small error here to tell the user that every parameter is in order
        // for the time slider, but that there are no layers that supports it.
        store.dispatch('addError', {
            error: new ErrorMessage('time_slider_no_active_time_layer', {}),
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
    return (
        query &&
        !isNaN(query) &&
        Number.isInteger(query) &&
        OLDEST_YEAR <= query &&
        YOUNGEST_YEAR >= query
    )
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
            acceptedValues: acceptedValues,
        })
    }
}
