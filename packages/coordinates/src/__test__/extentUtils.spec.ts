import { describe, expect, it } from 'vitest'

import type { SingleCoordinate } from '@/coordinatesUtils'
import type { FlatExtent } from '@/extentUtils'

import coordinatesUtils from '@/coordinatesUtils'
import { getExtentIntersectionWithCurrentProjection, getExtentCenter } from '@/extentUtils'
import { LV95, WGS84 } from '@/proj'

describe('Test extent utils', () => {
    describe('reproject and cut extent within projection bounds', () => {
        function expectExtentIs(
            toBeTested: FlatExtent,
            expected: FlatExtent,
            acceptableDelta = 0.5
        ) {
            expect(toBeTested).to.be.an('Array').lengthOf(4)
            expected.forEach((value, index) => {
                expect(toBeTested[index]).to.be.approximately(value, acceptableDelta)
            })
        }

        it('reproject extent of a single coordinate inside the bounds of the projection', () => {
            const singleCoordinate: SingleCoordinate = [8.2, 47.5]
            const singleCoordinateInLV95 = coordinatesUtils.reprojectAndRound(
                WGS84,
                LV95,
                singleCoordinate
            )
            const extent = [singleCoordinate, singleCoordinate].flat() as FlatExtent
            const result = getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95)
            expect(result).to.be.an('Array').lengthOf(4)
            expectExtentIs(result!, [...singleCoordinateInLV95, ...singleCoordinateInLV95])
        })
        it('returns undefined if a single coordinate outside of bounds is given', () => {
            const singleCoordinateOutOfLV95Bounds = [8.2, 40]
            const extent = [
                singleCoordinateOutOfLV95Bounds,
                singleCoordinateOutOfLV95Bounds,
            ].flat() as FlatExtent
            expect(getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95)).to.be.undefined
        })
        it('returns undefined if the extent given is completely outside of the projection bounds', () => {
            const extent: FlatExtent = [-25.0, -20.0, -5.0, -45.0]
            expect(getExtentIntersectionWithCurrentProjection(extent, WGS84, LV95)).to.be.undefined
        })
        it('reproject and cut an extent that is greater than LV95 extent on all sides', () => {
            const result = getExtentIntersectionWithCurrentProjection(
                [-2.4, 35, 21.3, 51.7],
                WGS84,
                LV95
            )
            expect(result).to.be.an('Array').lengthOf(4)
            expectExtentIs(result!, [...LV95.bounds.bottomLeft, ...LV95.bounds.topRight])
        })
        it('reproject and cut an extent that is partially bigger than LV95 bounds', () => {
            const result = getExtentIntersectionWithCurrentProjection(
                // extent of file linked to PB-1221
                [-122.08, -33.85, 151.21, 51.5],
                WGS84,
                LV95
            )
            expect(result).to.be.an('Array').lengthOf(4)
            expectExtentIs(result!, [...LV95.bounds.bottomLeft, ...LV95.bounds.topRight])
        })
        it('only gives back the portion of an extent that is within LV95 bounds', () => {
            const singleCoordinateInsideLV95: SingleCoordinate = [7.54, 48.12]
            const singleCoordinateInLV95 = coordinatesUtils.reprojectAndRound(
                WGS84,
                LV95,
                singleCoordinateInsideLV95
            )
            const overlappingExtent: FlatExtent = [0, 0, ...singleCoordinateInsideLV95]
            const result = getExtentIntersectionWithCurrentProjection(
                overlappingExtent,
                WGS84,
                LV95
            )
            expect(result).to.be.an('Array').lengthOf(4)
            expectExtentIs(result!, [...LV95.bounds.bottomLeft, ...singleCoordinateInLV95])
        })
    })
    describe('getExtentCenter', () => {
        it('calculates the center of an extent', () => {
            const extent: FlatExtent = [0, 0, 30, 70]
            const center = getExtentCenter(extent)
            expect(center).to.be.an('Array').lengthOf(2)
            expect(center[0]).to.be.closeTo(15, 0.0001)
            expect(center[1]).to.be.closeTo(35, 0.0001)
        })
    })
})
