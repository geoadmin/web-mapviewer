import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class.ts'

const URL_PARAM_NAME = 'noSimpleZoom'

export default class NoSimpleZoomParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: URL_PARAM_NAME,
            mutationsToWatch: ['setNoSimpleZoomEmbed'],
            setValuesInStore: dispatchNoSimpleZoomFromUrlIntoStore,
            extractValueFromStore: (store) => store.state.ui.noSimpleZoomEmbed,
            keepInUrlWhenDefault: false,
            valueType: Boolean,
        })
    }
}

function dispatchNoSimpleZoomFromUrlIntoStore(to, store, urlParamValue) {
    if (to.path.toLowerCase().includes('embed')) {
        store.dispatch('setNoSimpleZoomEmbed', {
            noSimpleZoomEmbed: urlParamValue,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
}
