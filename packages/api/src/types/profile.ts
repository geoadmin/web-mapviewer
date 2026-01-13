import type { SingleCoordinate } from '@swissgeo/coordinates'

export interface ServiceProfileAltitudes {
    COMB?: number
    DTM2?: number
    DTM25?: number
}

export interface ServiceProfilePoints {
    alts?: ServiceProfileAltitudes
    dist: number
    easting: number
    northing: number
}

export interface ElevationProfilePoint {
    /** Distance from first to current point (relative to the whole profile, not by chunks) */
    dist?: number
    coordinate: SingleCoordinate
    /** Expressed in the COMB elevation model */
    elevation?: number
    hasElevationData: boolean
}

export interface ElevationProfileChunk {
    points: ElevationProfilePoint[]
    hasElevationData: boolean
    hasDistanceData: boolean
}

export interface ElevationProfileMetadata {
    totalLinearDist: number
    minElevation: number
    maxElevation: number
    elevationDifference: number
    totalAscent: number
    totalDescent: number
    /** Sum of slope/surface distances (distance on the ground) */
    slopeDistance: number
    /**
     * Hiking time calculation for the profile in minutes.
     *
     * Official formula: http://www.wandern.ch/download.php?id=4574_62003b89 Reference link:
     * http://www.wandern.ch
     *
     * But we use a slightly modified version from Schweizmobil
     */
    hikingTime: number
    hasElevationData: boolean
    hasDistanceData: boolean
}

export interface ElevationProfile {
    chunks: ElevationProfileChunk[]
    metadata: ElevationProfileMetadata
}
