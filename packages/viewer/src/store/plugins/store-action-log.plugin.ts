import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

function logActionOrMutation(actionName: string, actionArgs: unknown[]) {
    // the last argument is always the dispatcher
    const dispatcher = actionArgs.at(-1) as ActionDispatcher

    log.debug({
        title: `Action ${actionName}`,
        titleColor: LogPreDefinedColor.Red,
        messages: [`${actionName}`, `\ndispatcher: ${dispatcher.name}`, '\npayload', ...actionArgs],
    })
}

/** Plugin that will log any Vuex action or mutation */
const storeActionLogPlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ name, args }) => logActionOrMutation(name, args))
}

export default storeActionLogPlugin
