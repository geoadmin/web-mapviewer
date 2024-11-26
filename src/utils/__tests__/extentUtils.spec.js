import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { reprojectAndRound } from '@/utils/coordinates/coordinateUtils'
import { getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'

describe('Test extent utils', () => {
    describe('reproject and cut extent within projection bounds', () => {
        function expectExtentIs(toBeTested, expected, acceptableDelta = 0.5) {
            expect(toBeTested).to.be.an('Array').lengthOf(4)
            expected.forEach((value, index) => {
                expect(toBeTested[index]).to.be.approximately(value, acceptableDelta)
            })
        }

        it('handles well wrong inputs and returns null', () => {
            expect(getExtentIntersectionWithCurrentProjection()).to.be.null
            expect(getExtentIntersectionWithCurrentProjection(null, null, null)).to.be.null
            expect(getExtentIntersectionWithCurrentProjection(0, 0, 0)).to.be.null
            expect(getExtentIntersectionWithCurrentProjection({}, [], [])).to.be.null
            expect(getExtentIntersectionWithCurrentProjection([1, 2, 3], LV95, LV95)).to.be.null
        })
        it('reproject extent of a single coordinate inside the bounds of the projection', () => {
            const singleCoordinate = [8.2, 47.5]
            const singleCoordinateInLV95 = reprojectAndRound(WGS84, LV95, singleCoordinate)
            const extent = [singleCoordinate, singleCoordinate].flat()
            expectExtentIs(getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95), [
                ...singleCoordinateInLV95,
                ...singleCoordinateInLV95,
            ])
        })
        it('returns null if a single coordinate outside of bounds is given', () => {
            const singleCoordinateOutOfLV95Bounds = [8.2, 40]
            const extent = [singleCoordinateOutOfLV95Bounds, singleCoordinateOutOfLV95Bounds].flat()
            expect(getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95)).to.be.null
        })
        it('returns null if the extent given is completely outside of the projection bounds', () => {
            const extent = [-25.0, -20.0, -5.0, -45.0]
            expect(getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95)).to.be.null
        })
        it('reproject and cut an extent that is greater than LV95 extent on all sides', () => {
            expectExtentIs(
                getExtentIntersectionWithCurrentProjection([-2.4, 35, 21.3, 51.7], WGS84, LV95),
                [...LV95.bounds.bottomLeft, ...LV95.bounds.topRight]
            )
        })
        it('reproject and cut an extent that is partially bigger than LV95 bounds', () => {
            expectExtentIs(
                getExtentIntersectionWithCurrentProjection(
                    // extent of file linked to PB-1221
                    [-122.08, -33.85, 151.21, 51.5],
                    WGS84,
                    LV95
                ),
                [...LV95.bounds.bottomLeft, ...LV95.bounds.topRight]
            )
        })
        it('only gives back the portion of an extent that is within LV95 bounds', () => {
            const singleCoordinateInsideLV95 = [7.54, 48.12]
            const singleCoordinateInLV95 = reprojectAndRound(
                WGS84,
                LV95,
                singleCoordinateInsideLV95
            )
            const overlappingExtent = [0, 0, ...singleCoordinateInsideLV95]
            expectExtentIs(
                getExtentIntersectionWithCurrentProjection(overlappingExtent, WGS84, LV95),
                [...LV95.bounds.bottomLeft, ...singleCoordinateInLV95]
            )
        })
    })
})
