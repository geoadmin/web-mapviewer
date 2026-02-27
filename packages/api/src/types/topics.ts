import type { GeoAdminGroupOfLayers, GeoAdminLayer, Layer } from '@swissgeo/layers'

/** Representation of a topic (a subset of layers to be shown to the user) */
export interface Topic {
    readonly id: string
    /** The list of layers eligible for background when this topic is active */
    readonly backgroundLayers: GeoAdminLayer[]
    /**
     * The layer that should be activated as the background layer by default when this topic is
     * selected. The value will be set to undefined when the void layer should be selected.
     */
    readonly defaultBackgroundLayer: GeoAdminLayer | undefined
    /**
     * All layers that should be added to the displayed layer (but not necessarily visible, that
     * will depend on their state)
     */
    readonly layersToActivate: Layer[]
}

export interface CatalogServerResponseLayer {
    id: string
    category: 'layer'
    staging: 'dev' | 'int' | 'prod'
    label: string
    layerBodId: string
}

export interface CatalogServerResponseCategory {
    id: string
    category: 'topic'
    staging: 'dev' | 'int' | 'prod'
    label: string
    selectedOpen: boolean
    children: (CatalogServerResponseCategory | CatalogServerResponseLayer)[]
}

export interface CatalogServerResponseRoot {
    id: string
    children: CatalogServerResponseCategory[]
}

export interface CatalogServerResponse {
    results: {
        root: CatalogServerResponseRoot
    }
}

export interface TopicTree {
    layers: (GeoAdminLayer | GeoAdminGroupOfLayers)[]
    itemIdToOpen: string[]
}

export interface ServicesResponseTopic {
    id: string
    defaultBackground: string
    backgroundLayers: string[]
    selectedLayers: string[]
    activatedLayers: string[]
    plConfig: string
    groupId: number
}

export interface ServicesResponse {
    topics: ServicesResponseTopic[]
}
