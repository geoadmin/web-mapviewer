export interface ShareStoreState {
    /**
     * Short link version of the current map position (and layers, and all...). This will not be
     * defined each time, but only when the share menu is opened first (it will then be updated
     * whenever the URL changes to match it)
     */
    shortLink: string | undefined
    /**
     * The state of the shortlink share menu section. As we need to be able to change this whenever
     * the user moves the map, and it should only be done within mutations.
     */
    isMenuSectionShown: boolean
}

export type ShareStoreGetters = object

export type ShareStore = ReturnType<typeof import('@/store/modules/share').default>
