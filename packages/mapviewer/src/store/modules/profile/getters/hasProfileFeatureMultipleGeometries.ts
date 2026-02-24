import type { ProfileStore } from '@/store/modules/profile/types'

export default function hasProfileFeatureMultipleGeometries(this: ProfileStore): boolean {
    return (
        !!this.feature?.geometry &&
        this.feature.geometry?.type === 'MultiPolygon' &&
        this.feature.geometry.coordinates.length > 1
    )
}
