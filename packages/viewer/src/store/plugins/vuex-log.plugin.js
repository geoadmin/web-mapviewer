import log, { LogPreDefinedColor } from '@swissgeo/log'

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
    log.debug({
        title: `store ${type}`,
        titleColor: logColor,
        messages: [
            `${actionOrMutation.type}`,
            `\ndispatcher: ${getDispatcher(actionOrMutation)}`,
            '\npayload',
            getPayload(actionOrMutation),
        ],
    })
}

/**
 * Plugin that will log any Vuex action or mutation
 *
 * @param {Vuex.Store} store
 */
const vuexLogPlugin = (store) => {
    store.subscribe((mutation) =>
        logActionOrMutation(mutation, 'mutation', LogPreDefinedColor.Cyan)
    )
    store.subscribeAction((action, _state) =>
        logActionOrMutation(action, 'action', LogPreDefinedColor.Red)
    )
}

export default vuexLogPlugin
