import { defineStore } from 'pinia'

import type { DebugStoreGetters, DebugStoreState } from '@/store/modules/debug/types/debug'

import setHasBaseUrlOverrides from '@/store/modules/debug/actions/setHasBaseUrlOverrides'
import toggleShowLayerExtents from '@/store/modules/debug/actions/toggleShowLayerExtents'
import toggleShowTileDebugInfo from '@/store/modules/debug/actions/toggleShowTileDebugInfo.'

const state = (): DebugStoreState => ({
    showTileDebugInfo: false,
    showLayerExtents: false,
    hasBaseUrlOverrides: false,
})

const getters: DebugStoreGetters = {}

const actions = {
    toggleShowTileDebugInfo,
    toggleShowLayerExtents,
    setHasBaseUrlOverrides,
}

const useDebugStore = defineStore('debug', {
    state,
    getters: { ...getters },
    actions,
})

export default useDebugStore
