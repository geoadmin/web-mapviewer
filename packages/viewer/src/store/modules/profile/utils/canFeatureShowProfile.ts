import type { SelectableFeature } from '@/api/features.api'

export function canFeatureShowProfile(feature?: SelectableFeature<boolean>): boolean {
    return (
        !!feature?.geometry &&
        ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
            feature?.geometry?.type
        )
    )
}
