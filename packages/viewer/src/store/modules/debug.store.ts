import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

/** Module that contains debug tools things */
interface DebugState {
    showTileDebugInfo: boolean
    showLayerExtents: boolean
    hasBaseUrlOverrides: boolean
}

const useDebugStore = defineStore('debug', {
    state: (): DebugState => ({
        showTileDebugInfo: false,
        showLayerExtents: false,
        hasBaseUrlOverrides: false,
    }),
    getters: {},
    actions: {
        toggleShowTileDebugInfo(dispatcher: ActionDispatcher) {
            this.showTileDebugInfo = !this.showTileDebugInfo
        },

        toggleShowLayerExtents(dispatcher: ActionDispatcher) {
            this.showLayerExtents = !this.showLayerExtents
        },

        setHasBaseUrlOverrides(hasOverrides: boolean, dispatcher: ActionDispatcher) {
            this.hasBaseUrlOverrides = hasOverrides
        },
    },
})

export default useDebugStore
