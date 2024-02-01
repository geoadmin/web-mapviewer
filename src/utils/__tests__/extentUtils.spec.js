import { expect } from 'chai'
import proj4 from 'proj4'
import { describe, it } from 'vitest'

import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getExtentForProjection } from '@/utils/extentUtils'

describe('Test extent utils', () => {
    describe('reproject and cut extent within projection bounds', () => {
        it('handles well wrong inputs and returns null', () => {
            expect(getExtentForProjection()).to.be.null
            expect(getExtentForProjection(null, null)).to.be.null
            expect(getExtentForProjection(0, 0)).to.be.null
            expect(getExtentForProjection({}, [])).to.be.null
            expect(getExtentForProjection(LV95, [1, 2, 3])).to.be.null
        })
        it('reproject extent of a single coordinate inside the bounds of the projection', () => {
            const singleCoordinate = [8.2, 47.5]
            const singleCoordinateInLV95 = proj4(WGS84.epsg, LV95.epsg, singleCoordinate).map(
                LV95.roundCoordinateValue
            )
            const extent = [singleCoordinate, singleCoordinate].flat()
            expect(getExtentForProjection(LV95, extent)).to.deep.equal([
                singleCoordinateInLV95,
                singleCoordinateInLV95,
            ])
        })
        it('returns null if a single coordinate outside of bounds is given', () => {
            const singleCoordinateOutOfLV95Bounds = [8.2, 40]
            const extent = [singleCoordinateOutOfLV95Bounds, singleCoordinateOutOfLV95Bounds].flat()
            expect(getExtentForProjection(LV95, extent)).to.be.null
        })
        it('returns null if the extent given is completely outside of the projection bounds', () => {
            const extent = [-5.0, -20.0, -25.0, -45.0]
            expect(getExtentForProjection(LV95, extent)).to.be.null
        })
        it('reproject and cut an extent that is greater than LV95 extent on all sides', () => {
            const projectedExtent = getExtentForProjection(LV95, [-2.4, 35, 21.3, 51.7])
            expect(projectedExtent).to.deep.equal([LV95.bounds.bottomLeft, LV95.bounds.topRight])
        })
        it('only gives back the portion of an extent that is within LV95 bounds', () => {
            const singleCoordinateInsideLV95 = [7.54, 48.12]
            const singleCoordinateInLV95 = proj4(
                WGS84.epsg,
                LV95.epsg,
                singleCoordinateInsideLV95
            ).map(LV95.roundCoordinateValue)
            const overlappingExtent = [0, 0, ...singleCoordinateInsideLV95]
            expect(getExtentForProjection(LV95, overlappingExtent)).to.deep.equal([
                LV95.bounds.bottomLeft,
                singleCoordinateInLV95,
            ])
        })
    })
})
