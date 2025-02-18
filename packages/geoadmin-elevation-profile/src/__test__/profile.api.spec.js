import { expect } from 'chai'
import { describe, it } from 'vitest'

import { splitIfTooManyPoints } from '@/profile.api'

describe('splitIfTooManyPoints', () => {
    /**
     * @param {Number} pointsCount
     * @returns {CoordinatesChunk}
     */
    function generateChunkWith(pointsCount) {
        const coordinates = []
        for (let i = 0; i < pointsCount; i++) {
            coordinates.push([0, i])
        }
        return {
            coordinates,
            isWithinBounds: true,
        }
    }

    it('does not split a segment that does not contain more point than the limit', () => {
        const result = splitIfTooManyPoints(generateChunkWith(3000))
        expect(result).to.be.an('Array').lengthOf(1)
        expect(result[0].coordinates).to.be.an('Array').lengthOf(3000)
    })
    it('splits if one coordinates above the limit', () => {
        const result = splitIfTooManyPoints(generateChunkWith(3001))
        expect(result).to.be.an('Array').lengthOf(2)
        expect(result[0].coordinates).to.be.an('Array').lengthOf(3000)
        expect(result[1].coordinates).to.be.an('Array').lengthOf(1)
    })
    it('creates as many sub-chunks as necessary', () => {
        const result = splitIfTooManyPoints(generateChunkWith(3000 * 4 + 123))
        expect(result).to.be.an('Array').lengthOf(5)
        for (let i = 0; i < 4; i++) {
            expect(result[i].coordinates).to.be.an('Array').lengthOf(3000)
        }
        expect(result[4].coordinates).to.be.an('Array').lengthOf(123)
    })
})
