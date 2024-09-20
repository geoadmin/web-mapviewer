import { describe, expect, it } from 'vitest'

import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import StandardCoordinateSystem from '@/utils/coordinates/StandardCoordinateSystem.class'
import { LV95_RESOLUTIONS } from '@/utils/coordinates/SwissCoordinateSystem.class'

describe('CoordinateSystem', () => {
    const coordinateSystemWithouBounds = new StandardCoordinateSystem('test', 'test', 1234, null)
    describe('getBoundsAs', () => {
        it('returns null if the bounds are not defined', () => {
            expect(coordinateSystemWithouBounds.getBoundsAs(WEBMERCATOR)).to.be.null
        })
        it('transforms LV95 into WebMercator correctly', () => {
            const result = LV95.getBoundsAs(WEBMERCATOR)
            expect(result).to.be.an.instanceOf(CoordinateSystemBounds)
            // numbers are coming from epsg.io's transform tool
            const acceptableDelta = 0.01
            expect(result.lowerX).to.approximately(572215.44, acceptableDelta)
            expect(result.lowerY).to.approximately(5684416.96, acceptableDelta)
            expect(result.upperX).to.approximately(1277662.36, acceptableDelta)
            expect(result.upperY).to.approximately(6145307.39, acceptableDelta)
        })
        it('transforms LV95 into WGS84 correctly', () => {
            const result = LV95.getBoundsAs(WGS84)
            expect(result).to.be.an.instanceOf(CoordinateSystemBounds)
            // numbers are coming from epsg.io's transform tool
            const acceptableDelta = 0.0001
            expect(result.lowerX).to.approximately(5.14029, acceptableDelta)
            expect(result.lowerY).to.approximately(45.39812, acceptableDelta)
            expect(result.upperX).to.approximately(11.47744, acceptableDelta)
            expect(result.upperY).to.approximately(48.23062, acceptableDelta)
        })
    })
    describe('isInBound', () => {
        it('returns false if no bounds are defined', () => {
            expect(coordinateSystemWithouBounds.isInBounds(0, 0)).to.be.false
            expect(coordinateSystemWithouBounds.isInBounds(1, 1)).to.be.false
        })
        // remaining test for this function are handled in the CoordinateSystemBounds.class.spec.js file
    })
    describe('getResolutions', () => {
        it('returns all standard (Mercator) resolutions', () => {
            const resolutions = WEBMERCATOR.getResolutions()
            expect(resolutions).to.be.an('Array').lengthOf(21)

            // mashup of values from https://wiki.openstreetmap.org/wiki/Zoom_levels (from zoom 0 to 18)
            // and https://wiki.openstreetmap.org/wiki/Zoom_levels (zoom 19 and 20)
            const expectedResolutions = [
                156543.03, 78271.52, 39135.76, 19567.88, 9783.94, 4891.97, 2445.98, 1222.99, 611.5,
                305.75, 152.87, 76.437, 38.219, 19.109, 9.5546, 4.7773, 2.3887, 1.1943, 0.5972,
                0.299, 0.149,
            ]

            resolutions.forEach((resolutionStep, index) => {
                expect(resolutionStep).to.be.an('Object')
                expect(resolutionStep.zoom).to.eq(index)
                expect(resolutionStep.resolution).to.be.greaterThan(0)

                // see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
                // the formula that was used is : resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
                // with latitude being 47° (about Bern's latitude)
                expect(
                    resolutionStep.resolution,
                    `zoom level ${index} resolution is wrongly calculated`
                ).to.be.closeTo(expectedResolutions[index], 0.01)
            })
        })
        it.skip('returns all LV95 resolutions', () => {
            const resolutions = LV95.getResolutions()
            expect(resolutions).to.be.an('Array').lengthOf(LV95_RESOLUTIONS.length)

            resolutions.forEach((resolutionStep, index) => {
                expect(resolutionStep).to.be.an('Object')
                expect(resolutionStep.zoom).to.eq(index)
                expect(
                    resolutionStep.resolution,
                    `wrong LV95 resolution at zoom level ${index}`
                ).to.be.eq(LV95_RESOLUTIONS[index])
            })
        })
    })
})
