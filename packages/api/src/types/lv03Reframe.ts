import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'

export interface ReframeConfig {
    /** LV95 or LV03 coordinate that we want expressed in the other coordinate system */
    inputCoordinates: SingleCoordinate
    /** Tells which projection is used to describe the input coordinate. Must be either LV03 or LV95. */
    inputProjection: CoordinateSystem
    /**
     * Tells which projection the output coordinates should be expressed into. If nothing is given,
     * the "opposite" swiss projection of the input will be chosen (if LV03 coordinates are given,
     * the output will be LV95 coordinates, and vice versa)
     */
    outputProjection?: CoordinateSystem
}
