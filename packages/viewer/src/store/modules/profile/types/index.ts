import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import type { SelectableFeature } from '@/api/features/types'

export interface ProfileStoreState {
    feature?: SelectableFeature
    simplifyGeometry: boolean
    /**
     * Tells which part of a MultiLineString or Polygon is to be shown as the profile. Will also be
     * used jointly with the currentMultiFeatureIndex when dealing with MultiPolygons
     */
    currentFeatureGeometryIndex: number
}

export interface ProfileStoreGetters {
    /** @returns True if the profile feature is a LineString or Polygon */
    isProfileFeatureMultiFeature(): boolean
    /**
     * Checks if the profile feature is a MultiPolygon describing multiple "rings" (aka polygons
     * with holes, or disjointed parts)
     */
    hasProfileFeatureMultipleGeometries(): boolean
    currentProfileCoordinates(): SingleCoordinate[] | undefined
    currentProfileExtent(): FlatExtent | undefined
}

export type ProfileStore = ReturnType<typeof import('@/store/modules/profile').default>
