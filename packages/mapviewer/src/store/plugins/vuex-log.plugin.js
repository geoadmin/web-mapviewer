import log from '@geoadmin/log'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'

function getDispatcher(actionOrMutation) {
    let dispatcher
    if (actionOrMutation?.payload?.dispatcher) {
        dispatcher = actionOrMutation.payload.dispatcher
        // the CI can't show complex objects in the console, so we stringify them to be able to read them anyway
        if (IS_TESTING_WITH_CYPRESS) {
            dispatcher = JSON.stringify(dispatcher)
        }
    }
    return dispatcher
}

function getPayload(actionOrMutation) {
    let payload
    if (actionOrMutation?.payload) {
        payload = actionOrMutation.payload
        // the CI can't show complex objects in the console, so we stringify them to be able to read them anyway
        if (IS_TESTING_WITH_CYPRESS) {
            payload = JSON.stringify(payload)
        }
    }
    return payload
}

function logActionOrMutation(actionOrMutation, type, logColor) {
    log.debug(
        `%c[store ${type}]%c ${actionOrMutation.type}%c\ndispatcher: %c${getDispatcher(actionOrMutation)}%c\npayload`,
        `color: #000; font-weight: bold; background-color: ${logColor}; padding: 2px 4px; border-radius: 4px;`,
        'font-weight: bold;',
        'font-weight: unset;',
        'font-weight: bold;',
        'font-weight: unset;',
        getPayload(actionOrMutation)
    )
}

/**
 * Plugin that will log any Vuex action or mutation
 *
 * @param {Vuex.Store} store
 */
const vuexLogPlugin = (store) => {
    store.subscribe((mutation) => logActionOrMutation(mutation, 'mutation', '#66afe9'))
    store.subscribeAction((action, _state) => logActionOrMutation(action, 'action', '#dc0018'))
}

export default vuexLogPlugin
