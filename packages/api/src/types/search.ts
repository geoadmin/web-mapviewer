import type { CoordinateSystem, FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import type { DrawingIconSet } from '@/types/icons'

// API file that covers the backend endpoint http://api3.geo.admin.ch/services/sdiservices.html#search

export type SearchResultTypes = 'LAYER' | 'LOCATION' | 'FEATURE'

export interface SearchResult {
    resultType: SearchResultTypes
    /** ID of this search result */
    id: string
    /** Title of this search result (can be HTML as a string) */
    title: string
    /** The title without any HTML tags (will keep what's inside <b> or <i> tags if there are) */
    sanitizedTitle: string
    /** A description of this search result (plain text only, no HTML) */
    description: string
}

export interface LayerSearchResult extends SearchResult {
    /** ID of the layer in the layers config */
    layerId: string
}

export interface LocationSearchResult extends SearchResult {
    /**
     * ID of this feature given by the backend (can be then used to access other information about
     * the feature, such as the HTML popup). If the backend doesn't give a feature ID for this
     * feature, the description will be used as a fallback ID.
     */
    featureId: string
    /** Coordinate of this feature where to anchor the popup */
    coordinate?: SingleCoordinate
    /**
     * Extent of this feature described as `[ [bottomLeftCoords], [topRightCoords] ]` (if this
     * feature is a point, there will be two times the same point in the extent)
     */
    extent?: FlatExtent
    /**
     * The zoom level at which the map should be zoomed when showing the feature (if the extent is
     * defined, this should be ignored). The zoom level correspond to a zoom level in the projection
     * system this feature was requested in.
     */
    zoom: number
}

export interface LayerFeatureSearchResult extends LayerSearchResult, LocationSearchResult {
    /** The layer of this feature. */
    layer: Layer
}

export interface SearchResponseResult {
    id: number
    weight: number
    attrs?: {
        featureId: string
        detail: string
        geom_quadindex: string
        geom_st_box2d: string
        label: string
        lat: number
        lon: number
        num: number
        objectclass: string
        origin: string
        rank: number
        x: number
        y: number
        zoomlevel: number
        layer?: string
    }
}

export interface SearchResponse {
    results: SearchResponseResult[]
}

export interface SearchConfig {
    /** The projection in which the search results must be returned */
    outputProjection: CoordinateSystem
    /** The query string that describe what is wanted from the search */
    queryString: string
    /** The lang ISO code in which the search must be conducted */
    lang: string
    /** The resolution of the map in which the search must be conducted, in meters per pixel */
    resolution: number
    /** List of searchable layers for which to fire search requests. */
    layersToSearch?: Layer[]
    /** The maximum number of results to return */
    limit?: number
    iconSets?: DrawingIconSet[]
}
