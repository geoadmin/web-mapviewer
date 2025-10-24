import type { SingleCoordinate } from '@swissgeo/coordinates'

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

function stitchMultiLineStringRecurse(
    currentLine: SingleCoordinate[],
    remainingLines: SingleCoordinate[][],
    previouslyUsedIndexes: number[] = [],
    tolerance: number = 10.0
): { result: SingleCoordinate[]; usedIndex: number[] } {
    let currentLineBeingStitched: SingleCoordinate[] = [...currentLine]
    let someStitchHappened: boolean = false
    const usedIndex: number[] = [...previouslyUsedIndexes]

    remainingLines.forEach((line, index) => {
        // if line was already used elsewhere, skip it
        if (usedIndex.includes(index)) {
            return
        }

        const firstPoint: SingleCoordinate = currentLineBeingStitched[0]!
        const lastPoint: SingleCoordinate =
            currentLineBeingStitched[currentLineBeingStitched.length - 1]!
        const lineFirstPoint: SingleCoordinate = line[0]!
        const lineLastPoint: SingleCoordinate = line[line.length - 1]!

        if (canPointsBeStitched(firstPoint, lineLastPoint, tolerance)) {
            currentLineBeingStitched = [...line, ...currentLineBeingStitched]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(firstPoint, lineFirstPoint, tolerance)) {
            currentLineBeingStitched = [...line.toReversed(), ...currentLineBeingStitched]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(lastPoint, lineFirstPoint, tolerance)) {
            currentLineBeingStitched = [...currentLineBeingStitched, ...line]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(lastPoint, lineLastPoint, tolerance)) {
            currentLineBeingStitched = [...currentLineBeingStitched, ...line.toReversed()]
            someStitchHappened = true
            usedIndex.push(index)
        }
    })

    if (someStitchHappened) {
        return stitchMultiLineStringRecurse(currentLineBeingStitched, remainingLines, usedIndex)
    }

    return { result: currentLineBeingStitched, usedIndex }
}

function canPointsBeStitched(
    p1: SingleCoordinate,
    p2: SingleCoordinate,
    tolerance: number = 10.0
): boolean {
    return (
        (p1[0] === p2[0] && p1[1] === p2[1]) ||
        Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) <= tolerance
    )
}
