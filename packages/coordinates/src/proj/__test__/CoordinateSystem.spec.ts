import { describe, expect, it } from 'vitest'

import { LV95, WEBMERCATOR, WGS84 } from '@/proj'
import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'
import StandardCoordinateSystem from '@/proj/StandardCoordinateSystem'

class BoundlessCoordinateSystem extends StandardCoordinateSystem {
    constructor() {
        super({
            usesMercatorPyramid: false,
            proj4transformationMatrix: 'test',
            label: 'test',
            epsgNumber: 1234,
        })
    }
    getResolutionForZoom(): number {
        return 0
    }

    getZoomForResolution(): number {
        return 0
    }

    roundCoordinateValue(): number {
        return 0
    }
}

describe('CoordinateSystem', () => {
    const coordinateSystemWithouBounds = new BoundlessCoordinateSystem()
    describe('getBoundsAs', () => {
        it('returns undefined if the bounds are not defined', () => {
            expect(coordinateSystemWithouBounds.getBoundsAs(WEBMERCATOR)).to.be.undefined
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
        // the remaining tests for this function are handled in the CoordinateSystemBounds.spec.ts file
    })
})
