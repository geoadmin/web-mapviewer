import { reprojectUnknownSrsCoordsToWGS84 } from '@/utils/coordinates/coordinateUtils'
import setupProj4 from '@/utils/setupProj4'
import { expect } from 'chai'
import { describe, it } from 'vitest'

// setting up projection for proj4 otherwise they will fail when asked
setupProj4()

describe('Unit test functions from coordinateUtils.js', () => {
    describe('reprojectUnknownSrsCoordsToWGS84(x,y)', () => {
        const lv03 = {
            x: 600000,
            y: 190000,
        }
        const lv95 = {
            x: 2600000,
            y: 1190000,
        }
        const webMercator = {
            x: 828064.95,
            y: 5919436.34,
        }
        const wgs84 = {
            lon: 46.86113,
            lat: 7.438634,
        }
        const checkFunctionOutputs = (output, expectedOutput, acceptableDelta = 0.00001) => {
            if (expectedOutput) {
                expect(output).to.be.an('Array').lengthOf(2)
                // the function reprojectUnknownSrsCoordsToWGS84 outputs a lat,lon
                const [lat, lon] = output
                expect(lon).to.be.approximately(expectedOutput.lon, acceptableDelta)
                expect(lat).to.be.approximately(expectedOutput.lat, acceptableDelta)
            } else {
                expect(output).to.be.undefined
            }
        }
        it('handles LV03 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(lv03.x, lv03.y), wgs84)
        })
        it('handles inverted LV03 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(lv03.y, lv03.x), wgs84)
        })
        it('handles LV95 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(lv95.x, lv95.y), wgs84)
        })
        it('handles inverted LV95 coordinates', () => {
            // trying the same thing but with inverted X,Y
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(lv95.y, lv95.x), wgs84)
        })
        it('handles WebMercator coordinates (in LV95 bounds)', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWGS84(webMercator.x, webMercator.y),
                wgs84
            )
        })
        it('rejects WebMercator coordinates that are out of LV95 bounds', () => {
            // roughly equivalent to 5° lon, 45° lat in WGS84
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(556597.45, 4865942.27), undefined)
        })
        it('handles WGS84 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(wgs84.lon, wgs84.lat), wgs84)
        })
        it('handles inverted WGS84 coordinates', () => {
            // here the function will not be able to detect that we have inverted lat/lon
            // as values for both of theme are under latitude limits
            // (so no way of telling which one is lat or lon)
            // thus the function will output them inverted
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWGS84(wgs84.lat, wgs84.lon), {
                lat: wgs84.lon,
                lon: wgs84.lat,
            })
        })
    })
})
