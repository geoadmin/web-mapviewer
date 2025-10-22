/** Module that tells if the app has finished loading (is ready to show stuff) */
export interface AppStoreState {
    /** Flag that tells if the app is ready to show data and the map */
    isReady: boolean
    /**
     * Flag telling that the Map Module is ready. This is useful for E2E testing which should not
     * start before the Map Module is ready.
     */
    isMapReady: boolean
}
export type AppStoreGetters = object

export type AppStore = ReturnType<typeof import('../index.ts').default>
