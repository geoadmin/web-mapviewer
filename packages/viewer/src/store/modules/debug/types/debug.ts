export interface DebugStoreState {
    showTileDebugInfo: boolean
    showLayerExtents: boolean
    hasBaseUrlOverrides: boolean
}

export type DebugStoreGetters = object

export type DebugStoreStateAndGetters = DebugStoreState & DebugStoreGetters

export type DebugStore = ReturnType<typeof import('../index.ts').default>
