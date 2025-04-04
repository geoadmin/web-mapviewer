import { getStandardValidationResponse } from '@/api/errorQueues.api'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

export default class ScrollingModeParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'ctrl_scroll',
            mutationsToWatch: ['setScrollWithCtrlOnly'],
            setValuesInStore: dispatchScrollingModeFromUrlIntoStore,
            extractValueFromStore: (store) => store.state.ui.scrollWithCtrlOnly,
            keepInUrlWhenDefault: false,
            valueType: Boolean,
        })
    }
}

function dispatchScrollingModeFromUrlIntoStore(to, store) {
    const isEmbed = to.path.includes('embed')
    const hasScrollParam = 'ctrl_scroll' in to.query

    if (isEmbed && hasScrollParam) {
        store.dispatch('setScrollWithCtrlOnly', {
            scrollWithCtrlOnly: true,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
}
