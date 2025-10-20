import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'

function getPayload(actionArgs: unknown[]): unknown {
    if (IS_TESTING_WITH_CYPRESS) {
        // the CI can't show complex objects in the console, so we stringify them to be able to read them anyway
        return JSON.stringify(actionArgs)
    }
    return actionArgs
}

function logActionOrMutation(actionName: string, actionArgs: unknown[]) {
    // the last argument is always the dispatcher
    const dispatcher = actionArgs.at(-1) as ActionDispatcher

    log.debug({
        title: `store ${actionName}`,
        titleColor: LogPreDefinedColor.Red,
        messages: [
            `${actionName}`,
            `\ndispatcher: ${dispatcher.name}`,
            '\npayload',
            getPayload(actionArgs.slice(0, -1)),
        ],
    })
}

/** Plugin that will log any Vuex action or mutation */
const storeActionLogPlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ name, args }) => logActionOrMutation(name, args))
}

export default storeActionLogPlugin
