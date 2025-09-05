import type { SingleCoordinate } from '@/coordinatesUtils'

/**
 * Group of coordinates resulting in a "split by bounds" function. Will also contain information if
 * this chunk is within or outside the bounds from which it was cut from.
 */
export interface CoordinatesChunk {
    /** Coordinates of this chunk */
    coordinates: SingleCoordinate[]
    /** Will be true if this chunk contains coordinates that are located within bounds */
    isWithinBounds: boolean
}

/** Representation of a resolution step in a coordinate system. Can be linked to a zoom level or not. */
export interface ResolutionStep {
    /** Resolution of this step, in meters/pixel */
    resolution: number
    /** Corresponding zoom level for this resolution step */
    zoom?: number
    /** Name of the map product shown at this resolution/zoom */
    label?: string
}
