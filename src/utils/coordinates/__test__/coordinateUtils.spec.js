import { reprojectUnknownSrsCoordsToWebMercator } from '@/utils/coordinates/coordinateUtils'
import setupProj4 from '@/utils/setupProj4'
import { expect } from 'chai'
import { describe, it } from 'vitest'

// setting up projection for proj4 otherwise they will fail when asked
setupProj4()

describe('Unit test functions from coordinateUtils.js', () => {
    describe('reprojectUnknownSrsCoordsToWebMercator(x,y)', () => {
        const lv03 = {
            x: 600000,
            y: 190000,
        }
        const lv95 = {
            x: 2600000,
            y: 1190000,
        }
        const webMercator = {
            lon: 46.86113,
            lat: 7.438634,
        }
        const checkFunctionOutputs = (
            output,
            expectedOutput = webMercator,
            acceptableDelta = 0.00001
        ) => {
            if (expectedOutput) {
                expect(output).to.be.an('Array').lengthOf(2)
                // the function reprojectUnknownSrsCoordsToWebMercator outputs a lat,lon
                const [lat, lon] = output
                expect(lon).to.be.approximately(expectedOutput.lon, acceptableDelta)
                expect(lat).to.be.approximately(expectedOutput.lat, acceptableDelta)
            } else {
                expect(output).to.be.undefined
            }
        }
        it('handles LV03 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWebMercator(lv03.x, lv03.y))
        })
        it('handles inverted LV03 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWebMercator(lv03.y, lv03.x))
        })
        it('handles LV95 coordinates', () => {
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWebMercator(lv95.x, lv95.y))
        })
        it('handles inverted LV95 coordinates', () => {
            // trying the same thing but with inverted X,Y
            checkFunctionOutputs(reprojectUnknownSrsCoordsToWebMercator(lv95.y, lv95.x))
        })
        it('handles WebMercator coordinates', () => {
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWebMercator(webMercator.lon, webMercator.lat)
            )
        })
        it('handles inverted WebMercator coordinates', () => {
            // here the function will not be able to detect that we have inverted lat/lon
            // as values for both of theme are under latitude limits
            // (so no way of telling which one is lat or lon)
            // thus the function will output them inverted
            checkFunctionOutputs(
                reprojectUnknownSrsCoordsToWebMercator(webMercator.lat, webMercator.lon),
                {
                    lat: webMercator.lon,
                    lon: webMercator.lat,
                }
            )
        })
    })
})
