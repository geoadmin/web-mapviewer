import type { SingleCoordinate } from '@swissgeo/coordinates'

import { stitchMultiLineStringRecurse } from './stitchMultiLineStringRecurse'

/**
 * Stitch together connected LineStrings in a MultiLineString geometry.
 *
 * @param lines Elements of the MultiLineString.
 * @param tolerance How far away (in meters) two points can be and still be considered
 *   "stitch-candidate"
 * @returns Elements stitched togethers, if possible, or simply left as is if not.
 */
export function stitchMultiLine(
    lines: SingleCoordinate[][],
    tolerance: number = 10.0
): SingleCoordinate[][] {
    const results: SingleCoordinate[][] = []
    const globalUsedIndexes: number[] = []
    lines.forEach((line: SingleCoordinate[], index: number) => {
        // if line was already used, we can skip it (it's already included in some other line)
        if (globalUsedIndexes.includes(index)) {
            return
        }
        const { result, usedIndex } = stitchMultiLineStringRecurse(
            line,
            lines,
            [index, ...globalUsedIndexes],
            tolerance
        )
        globalUsedIndexes.push(...usedIndex)
        results.push(result)
    })
    return results
}
