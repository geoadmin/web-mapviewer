import { expect } from 'chai'
import proj4 from 'proj4'
import { describe, it } from 'vitest'

import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { reprojectUnknownSrsCoordsToWGS84 } from '@/utils/coordinates/coordinateUtils'

describe('Unit test functions from coordinateUtils.js', () => {
    describe('reprojectUnknownSrsCoordsToWGS84(x,y)', () => {
        const coordinatesLV95 = [2600000, 1190000]
        const coordinatesLV03 = proj4(LV95.epsg, LV03.epsg, coordinatesLV95)
        const coordinatesWebMercator = proj4(LV95.epsg, WEBMERCATOR.epsg, coordinatesLV95)
        const coordinatesWGS84 = proj4(LV95.epsg, WGS84.epsg, coordinatesLV95)
        const checkFunctionOutputs = (output, expectedOutput, acceptableDelta = 0.00001) => {
            if (expectedOutput) {
                expect(output).to.be.an('Array').lengthOf(2)
                const [x, y] = output
                expect(x).to.be.approximately(expectedOutput[0], acceptableDelta)
                expect(y).to.be.approximately(expectedOutput[1], acceptableDelta)
            } else {
                expect(output).to.be.undefined
            }
        }
        it('handles LV03 coordinates', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesLV03[0], coordinatesLV03[1]),
                coordinatesWGS84
            )
        })
        it('handles inverted LV03 coordinates', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesLV03[1], coordinatesLV03[0]),
                coordinatesWGS84
            )
        })
        it('handles LV95 coordinates', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesLV95[0], coordinatesLV95[1]),
                coordinatesWGS84
            )
        })
        it('handles inverted LV95 coordinates', () => {
            // trying the same thing but with inverted X,Y
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesLV95[1], coordinatesLV95[0]),
                coordinatesWGS84
            )
        })
        it('handles WebMercator coordinates (in LV95 bounds)', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(
                    coordinatesWebMercator[0],
                    coordinatesWebMercator[1]
                ),
                coordinatesWGS84
            )
        })
        it('rejects WebMercator coordinates that are out of LV95 bounds', () => {
            // roughly equivalent to 5° lon, 45° lat in WGS84
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(556597.45, 4865942.27), undefined)
        })
        it('handles WGS84 coordinates', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesWGS84[0], coordinatesWGS84[1]),
                coordinatesWGS84
            )
        })
        it('handles inverted WGS84 coordinates', () => {
            // Here the function will not be able to detect that we have inverted lat/lon as values for both of them
            // are under latitude limits. So no way of telling which one is lat or lon, thus the function will output
            // them inverted
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(coordinatesWGS84[1], coordinatesWGS84[0]),
                coordinatesWGS84
            )
        })
    })
})
