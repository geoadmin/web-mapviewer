import { OLDEST_YEAR, YOUNGEST_YEAR } from '@/config'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

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

/**
 * When the timeSlider parameter is set in the URL, if the year is a valid year, it will set the
 * timeSlider to active to the correct year. The parameter only appears if the time Slider is
 * active
 */
export default class TimeSliderParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'timeSlider',
            'setPreviewYear, setTimeSliderActive',
            dispatchTimeSliderFromUrlParam,
            generateTimeSliderUrlParamFromStore,
            false,
            Number,
            null
        )
    }
}
