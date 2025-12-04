import type { SelectableFeature } from '@/api/features/types'

export function canFeatureShowProfile(feature?: SelectableFeature): boolean {
    return (
        !!feature?.geometry &&
        ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
            feature?.geometry?.type
        )
    )
}
