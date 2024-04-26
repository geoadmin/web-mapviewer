import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

function setFeatureInfoPositionInStore(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    if (Object.values(FeatureInfoPositions).includes(urlParamValue?.toLowerCase())) {
        promisesForAllDispatch.push(
            store.dispatch('setFeatureInfoPosition', {
                position: urlParamValue.toLowerCase(),
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
    }
    return Promise.all(promisesForAllDispatch)
}

/**
 * As the name of the URL param is different from the name we give it in the store, this is a simple
 * "translation" config
 */
export default class FeatureInfoPositionParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'featureInfo',
            'setFeatureInfoPosition',
            setFeatureInfoPositionInStore,
            (store) => store.state.ui.featureInfoPosition,
            false,
            String,
            FeatureInfoPositions.NONE
        )
    }
}
