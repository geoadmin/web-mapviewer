import type useDebugStore from '@/store/modules/debug/index'

export interface DebugStoreState {
    showTileDebugInfo: boolean
    showLayerExtents: boolean
    hasBaseUrlOverrides: boolean
}

export type DebugStoreGetters = object

export type DebugStore = ReturnType<typeof useDebugStore>
