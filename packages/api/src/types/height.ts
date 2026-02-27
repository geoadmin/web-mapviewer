import type { SingleCoordinate } from '@swissgeo/coordinates'

export interface HeightForPosition {
    /** Lat/lon, the position for which the height was requested */
    readonly coordinates: SingleCoordinate
    /** The height for the position given by our backend */
    readonly heightInMeter: number
    readonly heightInFeet: number
}
