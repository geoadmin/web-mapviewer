export interface DebugStoreState {
    showTileDebugInfo: boolean
    showLayerExtents: boolean
    hasBaseUrlOverrides: boolean
}

export type DebugStoreGetters = object

export type DebugStore = ReturnType<typeof import('@/store/modules/debug').default>
