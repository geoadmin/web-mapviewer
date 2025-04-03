import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

export default class ScrollingModeParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'ctrl_scroll',
            setValuesInStore: dispatchScrollingModeFromUrlIntoStore,
            valueType: Boolean,
        })
    }
}

// This function is called when the URL changes and the value of the parameter is extracted from the URL
// we want to check if the destination url contains embed and scrolling_mode, and if it does,
// we want to set the setScrollWithCtrlOnly to true
function dispatchScrollingModeFromUrlIntoStore(to, store) {
    const isEmbed = to.path.includes('embed')
    const hasScrollParam = 'ctrl_scroll' in to.query
    console.error('dispatch function')
    console.error('dispatchScrollingModeFromUrlIntoStore', isEmbed, hasScrollParam)
    if (isEmbed && hasScrollParam) {
        store.dispatch('setScrollWithCtrlOnly', {
            show: true,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
}
