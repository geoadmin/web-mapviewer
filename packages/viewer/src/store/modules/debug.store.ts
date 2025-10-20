import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { DebugStoreActions } from '@/store/actions'

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
        [DebugStoreActions.ToggleShowTileDebugInfo](dispatcher: ActionDispatcher) {
            this.showTileDebugInfo = !this.showTileDebugInfo
        },

        [DebugStoreActions.ToggleShowLayerExtents](dispatcher: ActionDispatcher) {
            this.showLayerExtents = !this.showLayerExtents
        },

        [DebugStoreActions.SetHasBaseUrlOverrides](
            hasOverrides: boolean,
            dispatcher: ActionDispatcher
        ) {
            this.hasBaseUrlOverrides = hasOverrides
        },
    },
})

export default useDebugStore
