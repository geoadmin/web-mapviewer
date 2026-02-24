import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { sendMapReadyEventToParent } from '@/api/iframePostMessageEvent.api'
import useAppStore from '@/store/modules/app'

const dispatcher: ActionDispatcher = { name: 'stateMachinePlugin' }

const stateMachinePlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ name, after }) => {
        after(() => {
            const appStore = useAppStore()
            if (appStore.isCurrentStateFulfilled) {
                appStore.nextState(dispatcher)
            }
            if (name === 'nextState' && appStore.isMapReady) {
                sendMapReadyEventToParent()
            }
        })
    })
}

export default stateMachinePlugin
