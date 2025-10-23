import type { ProfileStore } from '@/store/modules/profile/types/profile'

export default function isProfileFeatureMultiFeature(this: ProfileStore): boolean {
    return (
        !!this.feature?.geometry &&
        ['MultiPolygon', 'MultiLineString'].includes(this.feature?.geometry?.type)
    )
}
