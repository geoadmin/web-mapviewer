import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import setupProj4 from '@/utils/setupProj4'
import { describe, expect, it } from 'vitest'

setupProj4()

describe('CoordinateSystem', () => {
    const coordinateSystemWithouBounds = new CoordinateSystem(
        'test',
        'test',
        1234,
        'test',
        '',
        null
    )
    describe('getBoundsAs', () => {
        it('returns null if the bounds are not defined', () => {
            expect(coordinateSystemWithouBounds.getBoundsAs(WEBMERCATOR)).to.be.null
        })
        it('transforms LV95 into WebMercator correctly', () => {
            const result = LV95.getBoundsAs(WEBMERCATOR)
            expect(result).to.be.an.instanceOf(CoordinateSystemBounds)
            // numbers are coming from epsg.io's transform tool
            const acceptableDelta = 0.01
            expect(result.lowerX).to.approximately(663493.48, acceptableDelta)
            expect(result.lowerY).to.approximately(5749992.92, acceptableDelta)
            expect(result.upperX).to.approximately(1180517.16, acceptableDelta)
            expect(result.upperY).to.approximately(6074795.45, acceptableDelta)
        })
        it('transforms LV95 into WGS84 correctly', () => {
            const result = LV95.getBoundsAs(WGS84)
            expect(result).to.be.an.instanceOf(CoordinateSystemBounds)
            // numbers are coming from epsg.io's transform tool
            const acceptableDelta = 0.0001
            expect(result.lowerX).to.approximately(5.96026, acceptableDelta)
            expect(result.lowerY).to.approximately(45.81024, acceptableDelta)
            expect(result.upperX).to.approximately(10.60476, acceptableDelta)
            expect(result.upperY).to.approximately(47.80693, acceptableDelta)
        })
    })
    describe('isInBound', () => {
        it('returns false if no bounds are defined', () => {
            expect(coordinateSystemWithouBounds.isInBounds(0, 0)).to.be.false
            expect(coordinateSystemWithouBounds.isInBounds(1, 1)).to.be.false
        })
        // remaining test for this function are handled in the CoordinateSystemBounds.class.spec.js file
    })
})
