import type { SingleCoordinate, FlatExtent } from '@swissgeo/coordinates'

import {
    DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION,
    DEFAULT_FEATURE_COUNT_SINGLE_POINT,
} from '@/config/map.config'

export default function getFeatureCountForCoordinate(
    coordinate: SingleCoordinate | FlatExtent
): number {
    return coordinate.length === 2
        ? DEFAULT_FEATURE_COUNT_SINGLE_POINT
        : DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION
}
