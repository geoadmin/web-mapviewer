import { expect } from 'chai'
import proj4 from 'proj4'
import { describe, it } from 'vitest'

import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import {
    flattenExtent,
    normalizeExtent,
    removeZValues,
    reprojectUnknownSrsCoordsToWGS84,
    toLv95,
    unwrapGeometryCoordinates,
} from '@/utils/coordinates/coordinateUtils'
import { wrapXCoordinates } from '@/utils/coordinates/coordinateUtils'

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
        it('normalize an extent', () => {
            const flatExtent = [1, 2, 3, 4]
            const result = normalizeExtent(flatExtent)
            expect(result).to.have.length(2)
            expect(result[0]).to.have.length(2)
            expect(result[1]).to.have.length(2)
            expect(result[0][0]).to.equal(1)
            expect(result[0][1]).to.equal(2)
            expect(result[1][0]).to.equal(3)
            expect(result[1][1]).to.equal(4)

            expect(normalizeExtent(result)).to.deep.equal(result)
        })
        it('flattern an extent', () => {
            const normalizedExtent = [
                [1, 2],
                [3, 4],
            ]
            const flatExtent = flattenExtent(normalizedExtent)
            expect(flatExtent).to.have.length(4)
            expect(flatExtent).to.deep.equal([1, 2, 3, 4])

            expect(flattenExtent(flatExtent)).to.deep.equal([1, 2, 3, 4])
        })
    })

    describe('toLv95(coordinate, "EPSG:4326")', () => {
        it('reprojects points from EPSG:4326', () => {
            expect(LV95.isInBounds(...toLv95([6.57268, 46.51333], WGS84.epsg))).to.be.true
        })
        it('reprojects points from EPSG:3857', () => {
            expect(LV95.isInBounds(...toLv95([731667, 5862995], WEBMERCATOR.epsg))).to.be.true
        })
        it('reprojects lines', () => {
            const result = toLv95(
                [
                    [6.57268, 46.51333],
                    [6.7, 46.7],
                ],
                WGS84.epsg
            )
            expect(result).to.be.an('Array').lengthOf(2)
            result.forEach((coord) => {
                expect(LV95.isInBounds(...coord)).to.be.true
            })
        })
        it('reprojects polygons', () => {
            const result = toLv95(
                [
                    [6.57268, 46.51333],
                    [6.7, 46.7],
                    [6.9, 46.9],
                    [6.57268, 46.51333],
                ],
                WGS84.epsg
            )
            expect(result).to.be.an('Array').lengthOf(4)
            result.forEach((coord) => {
                expect(LV95.isInBounds(...coord)).to.be.true
            })
        })
    })

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

    describe('unwrapGeometryCoordinates(coordinates)', () => {
        it('returns the input if nothing is required', () => {
            expect(unwrapGeometryCoordinates(null)).to.be.null
            expect(unwrapGeometryCoordinates(undefined)).to.be.undefined
            expect(unwrapGeometryCoordinates([])).to.be.an('Array').lengthOf(0)
            const alreadyUnwrappedCoordinates = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(unwrapGeometryCoordinates(alreadyUnwrappedCoordinates)).to.eql(
                alreadyUnwrappedCoordinates
            )
        })
        it('unwraps when required', () => {
            const expectedOutcome = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            const wrappedCoordinates = [expectedOutcome]
            expect(unwrapGeometryCoordinates(wrappedCoordinates)).to.eql(expectedOutcome)
        })
    })

    describe('removeZValues', () => {
        it('returns the input if invalid (no error raised)', () => {
            expect(removeZValues(null)).to.be.null
            expect(removeZValues(undefined)).to.be.undefined
            expect(removeZValues([])).to.eql([])
        })
        it('returns coordinate untouched if they have no Z values', () => {
            const coordinates = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(removeZValues(coordinates)).to.eql(coordinates)
        })
        it('removes Z values when needed', () => {
            const coordinateWithoutZValues = [
                [1, 2],
                [3, 4],
                [5, 6],
            ]
            expect(
                removeZValues(
                    coordinateWithoutZValues.map((coordinate) => [
                        coordinate[0],
                        coordinate[1],
                        Math.floor(1 + 10 * Math.random()),
                    ])
                )
            ).to.eql(coordinateWithoutZValues)
            // testing with only one coordinate
            expect(removeZValues([[1, 2, 3]])).to.eql([[1, 2]])
        })
    })
})
