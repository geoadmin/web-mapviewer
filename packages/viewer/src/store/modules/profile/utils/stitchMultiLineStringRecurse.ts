import type { SingleCoordinate } from '@swissgeo/coordinates'

import { canPointsBeStitched } from './canPointsBeStitched'

export function stitchMultiLineStringRecurse(
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
