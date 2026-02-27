import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { ProfileStore } from '@/store/modules/profile/types'

export default function currentProfileCoordinates(
    this: ProfileStore
): SingleCoordinate[] | undefined {
    if (!this.feature || !this.feature?.geometry) {
        return
    }
    if (this.feature.geometry.type === 'MultiPolygon') {
        // if the geometry is a MultiPolygon, we need to flatten it one level, so it can get processed as the other types
        return this.feature.geometry.coordinates.flat(1)[
            this.currentFeatureGeometryIndex
        ] as SingleCoordinate[]
    }
    if (
        this.feature.geometry.type === 'MultiLineString' ||
        this.feature.geometry.type === 'Polygon'
    ) {
        return this.feature.geometry.coordinates[
            this.currentFeatureGeometryIndex
        ] as SingleCoordinate[]
    }
    if (this.feature.geometry.type === 'LineString') {
        return this.feature.geometry.coordinates as SingleCoordinate[]
    }
    return
}
