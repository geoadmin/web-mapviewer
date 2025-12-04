import type { GeoAdminLayer } from '@swissgeo/layers'

import type { Topic } from '@/api/topics.api'

export interface TopicsStoreState {
    /** List of all available topics */
    config: Topic[]
    /**
     * Current topic ID (either default 'ech' at app startup, or another from the config later
     * chosen by the user)
     */
    current: string
    /** Current topic's layers tree (that will help the user select layers belonging to this topic) */
    tree: GeoAdminLayer[]
    /** The ids of the catalog nodes that should be open. */
    openedTreeThemesIds: string[]
}

export interface LoadTopicOptions {
    /** If the layers described in the topic should replace all existing layers currently active */
    changeLayers?: boolean
    /** Whether to open the geocatalog topic section*/
    openGeocatalogSection?: boolean
}

export type TopicsStoreGetters = {
    isDefaultTopic(): boolean
    currentTopic(): Topic | undefined
}

export type TopicsStoreStateAndGetters = TopicsStoreState & TopicsStoreGetters

export type TopicsStore = ReturnType<typeof import('@/store/modules/topics').default>
