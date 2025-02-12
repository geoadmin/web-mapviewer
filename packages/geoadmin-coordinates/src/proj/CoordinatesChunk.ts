/**
 * Group of coordinates resulting in a "split by bounds" function. Will also contain information if
 * this chunk is within or outside the bounds from which it was cut from.
 */
export type CoordinatesChunk = {
    /** Coordinates of this chunk */
    coordinates: [number, number][]
    /** Will be true if this chunk contains coordinates that are located within bounds */
    isWithinBounds: boolean
}
