import type { PiniaPluginContext } from 'pinia'

import type { ActionDispatcher } from '@/store/store'

import useAppStore from '@/store/modules/app.store'
import useLayersStore from '@/store/modules/layers.store'
import useTopicsStore from '@/store/modules/topics.store'
import useUIStore from '@/store/modules/ui.store'

const dispatcher: ActionDispatcher = { name: 'app-readiness-plugin' }

/**
 * Plugin that will listen to most mutation as long as a certain state of readiness is not reached.
 * When the state has loaded enough data / is ready, this plugin will trigger the mutation that will
 * set a flag to true and let the app know it can show the map and all linked functionalities.
 *
 * What is required for the app to be ready is :
 *
 * - Know the width and height of the viewport
 * - Have loaded the layers config
 * - Have loaded the topics config
 */
export function appReadinessPlugin(context: PiniaPluginContext) {
    const appStore = useAppStore()
    const layersStore = useLayersStore()
    const topicsStore = useTopicsStore()
    const uiStore = useUIStore()
    const unsubscribe = context.store.$subscribe(() => {
        // if the app is not ready yet, we go through the checklist
        if (!appStore.isReady) {
            if (
                uiStore.width > 0 &&
                uiStore.height > 0 &&
                layersStore.config.length > 0 &&
                topicsStore.config.length > 0
            ) {
                appStore.setAppIsReady(dispatcher)
            }
        } else {
            unsubscribe()
        }
    })
}

export default appReadinessPlugin
