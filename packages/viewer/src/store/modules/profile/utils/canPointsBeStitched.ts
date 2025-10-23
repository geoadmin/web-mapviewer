import type { SingleCoordinate } from '@swissgeo/coordinates'

export function canPointsBeStitched(
    p1: SingleCoordinate,
    p2: SingleCoordinate,
    tolerance: number = 10.0
): boolean {
    return (
        (p1[0] === p2[0] && p1[1] === p2[1]) ||
        Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) <= tolerance
    )
}
