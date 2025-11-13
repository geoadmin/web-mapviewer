import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import useAppStore from '@/store/modules/app'

const dispatcher: ActionDispatcher = { name: 'stateMachinePlugin' }

const stateMachinePlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ after }) => {
        after(() => {
            const appStore = useAppStore()
            if (appStore.isCurrentStateFulfilled) {
                appStore.nextState(dispatcher)
            }
        })
    })
}

export default stateMachinePlugin
