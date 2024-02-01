import { expect } from 'chai'
import { describe, it } from 'vitest'

import { wrapXCoordinates } from '@/modules/drawing/lib/drawingUtils'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

describe('Unit test functions from drawingUtils.js', () => {
    describe('wrapXCoordinates()', () => {
        it('Wrap in place', () => {
            const original = [
                [300, 300],
                [360, 360],
            ]
            const ref2Original = wrapXCoordinates(original, WGS84, true)
            expect(ref2Original).to.deep.equal([
                [-60, 300],
                [0, 360],
            ])
            expect(ref2Original).to.deep.equal(original)
        })
        it('Wrap not in place', () => {
            const original = [
                [300, 300],
                [360, 360],
            ]
            const ref2Original = wrapXCoordinates(original, WGS84, false)
            expect(ref2Original).to.deep.equal([
                [-60, 300],
                [0, 360],
            ])
            expect(ref2Original).to.not.deep.equal(original)
            expect(original).to.deep.equal([
                [300, 300],
                [360, 360],
            ])
        })
    })
})
