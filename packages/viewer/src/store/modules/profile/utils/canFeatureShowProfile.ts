import type { SelectableFeature } from '@swissgeo/api'

export function canFeatureShowProfile(feature?: SelectableFeature<boolean>): boolean {
    return (
        !!feature?.geometry &&
        ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
            feature?.geometry?.type
        )
    )
}
