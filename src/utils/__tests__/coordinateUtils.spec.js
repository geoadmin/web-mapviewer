import { TILEGRID_EXTENT_EPSG_3857 } from '@/config'
import {
    coordinateFromString,
    reprojectUnknownSrsCoordsToWebMercator,
    splitIfOutOfLV95Bounds,
} from '@/utils/coordinateUtils'
import setupProj4 from '@/utils/setupProj4'
import { expect } from 'chai'
import { describe, it } from 'vitest'

// setting up projection for proj4 otherwise they will fail when asked
setupProj4()

/**
 * Place a separator after each group of 3 digit
 *
 * @param {Number} number A number expressed as a string
 * @param {String} separator Which thousand separator to use
 * @returns {string} The number with thousand separators
 */
const numberWithThousandSeparator = (number, separator = "'") => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

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
    describe('coordinateFromString(text)', () => {
        /**
         * Gives text as input to coordinateFromString and check the output of this function
         *
         * @param {String} text The input to be given to coordinateFromString
         * @param {Number[]} expected What is expected of coordinateFromString as output
         * @param {String} message Message to be shown if the test fails (in the unit test log)
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable
         *   (default is zero)
         */
        const checkText = (text, expected, message, acceptableDelta = 0) => {
            const result = coordinateFromString(text)
            expect(result).to.be.an('Array', message)
            expect(result.length).to.eq(2, message)
            expect(result[0]).to.approximately(
                expected[0],
                acceptableDelta,
                message + '\nx result: ' + result[0] + '\n'
            )
            expect(result[1]).to.approximately(
                expected[1],
                acceptableDelta,
                message + '\ny result: ' + result[1] + '\n'
            )
        }
        /**
         * Checks that X and Y (given as param) output the expected X and Y with different
         * combination of coma, spaces, slash and tabs in between X and Y
         *
         * @param {Number, String} x X to be passed as input to coordinateFromString
         * @param {Number, String} y Y to be passed as input to coordinateFromString
         * @param {Number} xExpectedValue What coordinateFromString is expected to output as X
         * @param {Number} yExpectedValue What coordinateFromString is expected to output as Y
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable
         *   (default is zero)
         */
        const checkXY = (x, y, xExpectedValue, yExpectedValue, acceptableDelta = 0) => {
            const valueOutputInCaseOfErr = `x: ${x}, y: ${y}, expected x: ${xExpectedValue}, expected y: ${yExpectedValue}`
            // checking with simple space and tab
            checkText(
                `${x} ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space in between\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x}\t${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with tabs\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            // checking while placing separators with and without spaces before/after
            checkText(
                `${x},${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with coma\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x} ,${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space and coma\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x}, ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with coma and space\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x} , ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space, coma and space\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x}/${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with slash\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x} /${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space and slash\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x}/ ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with slash and space\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
            checkText(
                `${x} / ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space, slash and space\n' + valueOutputInCaseOfErr,
                acceptableDelta
            )
        }

        // values (in EPSG:3857) used throughout next cypress
        const EPSG3857 = [773900, 5976445]

        describe('Testing non valid inputs', () => {
            it('Returns undefined when anything else than numbers, coma, whitespaces and point is in the text', () => {
                expect(coordinateFromString('test')).to.be.undefined
                expect(coordinateFromString('47.0, 7.4test')).to.eq(
                    undefined,
                    'must not accept text after the coordinates'
                )
                expect(coordinateFromString('test47.0, 7.4')).to.eq(
                    undefined,
                    'must not accept text before the coordinates'
                )
            })
            it('Returns undefined when the given text is invalid (null or not a string)', () => {
                expect(coordinateFromString(null)).to.be.undefined
                expect(coordinateFromString(1234)).to.be.undefined
                expect(coordinateFromString([45.6, 7.4])).to.be.undefined
                expect(coordinateFromString({ lon: 7, lat: 45 })).to.be.undefined
            })
            it('Returns undefined when the given text is not two numbers separated by a coma, a space or a slash', () => {
                expect(coordinateFromString('47.0')).to.be.undefined
                expect(coordinateFromString('47.0,')).to.be.undefined
                expect(coordinateFromString('47.0,test')).to.be.undefined
                expect(coordinateFromString('47.0, test')).to.be.undefined
            })
            it("Returns undefined when coordinates entered don't match any projection bur are technically valid (two numbers)", () => {
                expect(coordinateFromString('600000, 20000')).to.be.undefined
            })
        })
        describe('EPSG:4326 (WGS84)', () => {
            const acceptableDelta = 0.1
            // lat/lon same place as [x,y] (used https://epsg.io for transformations)
            const WGS84 = [47.2101583, 6.952062]
            const WGS84_DM = ["47°12.6095'", "6°57.12372'"]
            const WGS84_DM_WITHOUT_SYMBOLS = ['47 12.6095', '6 57.12372']
            const WGS84_DMS = ['47°12\'36.57"', '6°57\'7.423"']
            const WGS84_DMS_WITHOUT_SYMBOLS = ['47 12 36.57', '6 57 7.423 ']

            it('Returns coordinates with degree decimal (DD) format', () => {
                checkXY(WGS84[0], WGS84[1], EPSG3857[0], EPSG3857[1], acceptableDelta)
            })
            it('Returns coordinates with DM (degree/minutes) format', () => {
                checkXY(WGS84_DM[0], WGS84_DM[1], EPSG3857[0], EPSG3857[1], acceptableDelta)
                const latWithSpaceBetweenDegAndMin = WGS84_DM[0].replace(/°/g, '° ')
                const lonWithSpaceBetweenDegAndMin = WGS84_DM[1].replace(/°/g, '° ')
                checkXY(
                    latWithSpaceBetweenDegAndMin,
                    lonWithSpaceBetweenDegAndMin,
                    EPSG3857[0],
                    EPSG3857[1]
                )
            })
            it('Returns coordinates with DMS (degree/minutes/seconds) format', () => {
                const latWithSpaceBetweenDegAndMin = WGS84_DMS[0].replace(/°/g, '° ')
                const lonWithSpaceBetweenDegAndMin = WGS84_DMS[1].replace(/°/g, '° ')

                const latWithSpaceBetweenDegAndMinAndSec = latWithSpaceBetweenDegAndMin.replace(
                    /'/g,
                    "' "
                )
                const lonWithSpaceBetweenDegAndMinAndSec = lonWithSpaceBetweenDegAndMin.replace(
                    /'/g,
                    "' "
                )

                // double quote notation for seconds
                checkXY(WGS84_DMS[0], WGS84_DMS[1], EPSG3857[0], EPSG3857[1], acceptableDelta)
                checkXY(
                    latWithSpaceBetweenDegAndMin,
                    lonWithSpaceBetweenDegAndMin,
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMinAndSec,
                    lonWithSpaceBetweenDegAndMinAndSec,
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )

                // two single quote notation for seconds
                checkXY(
                    WGS84_DMS[0].replace(/"/g, "''"),
                    WGS84_DMS[1].replace(/"/g, "''"),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMin.replace(/"/g, "''"),
                    lonWithSpaceBetweenDegAndMin.replace(/"/g, "''"),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMinAndSec.replace(/"/g, "''"),
                    lonWithSpaceBetweenDegAndMinAndSec.replace(/"/g, "''"),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DM format (degree minutes without symbols, aka Google style)', () => {
                checkXY(
                    WGS84_DM_WITHOUT_SYMBOLS[0],
                    WGS84_DM_WITHOUT_SYMBOLS[1],
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format (degree minutes without symbols, aka Google style)', () => {
                checkXY(
                    WGS84_DMS_WITHOUT_SYMBOLS[0],
                    WGS84_DMS_WITHOUT_SYMBOLS[1],
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format with cardinal point information', () => {
                const latWithCardinalNotation = WGS84_DMS[0] + 'N'
                const lonWithCardinalNotation = WGS84_DMS[1] + 'E'
                checkXY(
                    latWithCardinalNotation,
                    lonWithCardinalNotation,
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    lonWithCardinalNotation,
                    latWithCardinalNotation,
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format with cardinal point information in the south west hemisphere', () => {
                const pointInSouthAmericaInEPSG3857 = [-6504867, -4110554]
                const pointInSouthAmericaInEPSG4326 = ['34°36\'23.937"S', '58°26\'3.172"W']
                checkXY(
                    pointInSouthAmericaInEPSG4326[0],
                    pointInSouthAmericaInEPSG4326[1],
                    pointInSouthAmericaInEPSG3857[0],
                    pointInSouthAmericaInEPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    pointInSouthAmericaInEPSG4326[1],
                    pointInSouthAmericaInEPSG4326[0],
                    pointInSouthAmericaInEPSG3857[0],
                    pointInSouthAmericaInEPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format with cardinal point information in the north west hemisphere', () => {
                const pointInNorthAmericaInEPSG3857 = [-9457276, 4961988]
                const pointInNorthAmericaInEPSG4326 = ['40°39\'27.846"N', '84°57\'22.161"W']
                checkXY(
                    pointInNorthAmericaInEPSG4326[0],
                    pointInNorthAmericaInEPSG4326[1],
                    pointInNorthAmericaInEPSG3857[0],
                    pointInNorthAmericaInEPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    pointInNorthAmericaInEPSG4326[1],
                    pointInNorthAmericaInEPSG4326[0],
                    pointInNorthAmericaInEPSG3857[0],
                    pointInNorthAmericaInEPSG3857[1],
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format with cardinal point information in the south east hemisphere', () => {
                const pointInOceaniaInEPSG3857 = [12894439, -3757563]
                const pointInOceaniaInEPSG4326 = ['31°57\'22.332"S', '115°49\'57.779"E']
                checkXY(
                    pointInOceaniaInEPSG4326[0],
                    pointInOceaniaInEPSG4326[1],
                    pointInOceaniaInEPSG3857[0],
                    pointInOceaniaInEPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    pointInOceaniaInEPSG4326[1],
                    pointInOceaniaInEPSG4326[0],
                    pointInOceaniaInEPSG3857[0],
                    pointInOceaniaInEPSG3857[1],
                    acceptableDelta
                )
            })
        })

        /**
         * Checks that x and y will output the expected EPSG:3857 coordinate, whether X and Y are
         * expressed in LV95 or LV03. It will also try to enter X and Y backward, as it must be
         * supported by the app (coordinateFromString must detect which one is the north and which
         * one is the east part of the coordinate)
         *
         * @param {Number} x
         * @param {Number} y
         * @param {Number} acceptableDelta
         */
        const checkSwissCoordinateSystem = (x, y, acceptableDelta) => {
            it('Returns coordinates when input is valid', () => {
                checkXY(x, y, EPSG3857[0], EPSG3857[1], acceptableDelta)
            })
            it('Returns coordinates when input is entered backward', () => {
                checkXY(y, x, EPSG3857[0], EPSG3857[1], acceptableDelta)
            })
            it("Returns coordinates when there's thousands separator", () => {
                checkXY(
                    numberWithThousandSeparator(x),
                    numberWithThousandSeparator(y),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    numberWithThousandSeparator(x, ' '),
                    numberWithThousandSeparator(y, ' '),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
            it("Returns coordinates when there's thousands separator and input is entered backward", () => {
                checkXY(
                    numberWithThousandSeparator(y),
                    numberWithThousandSeparator(x),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
                checkXY(
                    numberWithThousandSeparator(y, ' '),
                    numberWithThousandSeparator(x, ' '),
                    EPSG3857[0],
                    EPSG3857[1],
                    acceptableDelta
                )
            })
        }

        describe('EPSG:2056 (LV95)', () => {
            // same place as [x,y] (used https://epsg.io for transformations)
            const LV95 = [2563138.69, 1228917.22]
            checkSwissCoordinateSystem(LV95[0], LV95[1], 0.1)
        })

        describe('EPSG:21781 (LV03)', () => {
            // same place as [x,y] (used https://epsg.io for transformations)
            const LV03 = [563138.65, 228917.28]
            checkSwissCoordinateSystem(LV03[0], LV03[1], 0.1)
        })

        describe('Military Grid Reference System (MGRS)', () => {
            // value from https://www.earthpoint.us/Convert.aspx
            const MGRS = '32TLT 44918 30553'
            it('Returns coordinates in EPSG:4326 when MGRS string is entered', () => {
                // as MGRS is a grid based system, what is return is essentially a 1-meter box.
                // So depending on which part of the box is taken, the answer is correct, we then tolerate here a margin of 1m
                checkText(MGRS, EPSG3857, 'MGRS not supported', 1)
            })
        })
    })
    describe('splitIfOutOfLV95Bounds(coordinates)', () => {
        it('returns null if invalid/malformed coordinates are given', () => {
            expect(splitIfOutOfLV95Bounds(null)).to.be.null
            expect(splitIfOutOfLV95Bounds(1)).to.be.null
            expect(splitIfOutOfLV95Bounds('test')).to.be.null
            expect(splitIfOutOfLV95Bounds([1, 2])).to.be.null
            expect(splitIfOutOfLV95Bounds([[3]])).to.be.null
            expect(splitIfOutOfLV95Bounds([[1, 2, 3]])).to.be.null
        })
        it('returns a single CoordinatesChunk if no split is needed', () => {
            const coordinatesWithinSwissBounds = [
                [760000, 6000000],
                [780000, 5980000],
                [800000, 5960000],
                [820000, 5940000],
                [840000, 5920000],
                [860000, 5900000],
                [880000, 5880000],
            ]
            const result = splitIfOutOfLV95Bounds(coordinatesWithinSwissBounds)
            expect(result).to.be.an('Array').of.length(1)
            const [singleChunk] = result
            expect(singleChunk).to.be.an('Object').that.hasOwnProperty('coordinates')
            expect(singleChunk).to.haveOwnProperty('isWithinLV95Bounds')
            expect(singleChunk.isWithinLV95Bounds).to.be.true
            expect(singleChunk.coordinates).to.eql(coordinatesWithinSwissBounds)
        })
        it('splits the given coordinates in two chunks if part of it is outside LV95 bounds', () => {
            const yValue = 6000000
            const coordinatesOverlappingSwissBounds = [
                [500000, yValue],
                [600000, yValue],
                [700000, yValue],
                [800000, yValue],
                [900000, yValue],
                [1000000, yValue],
            ]
            const result = splitIfOutOfLV95Bounds(coordinatesOverlappingSwissBounds)
            expect(result).to.be.an('Array').of.length(2)
            const [outOfBoundChunk, inBoundChunk] = result
            expect(outOfBoundChunk).to.haveOwnProperty('isWithinLV95Bounds')
            expect(outOfBoundChunk.isWithinLV95Bounds).to.be.false
            expect(outOfBoundChunk.coordinates).to.be.an('Array').of.length(2)
            expect(outOfBoundChunk.coordinates[0]).to.eql(coordinatesOverlappingSwissBounds[0])
            // checking that the split happened on the LV95 bounds
            const intersectingCoordinate = outOfBoundChunk.coordinates[1]
            expect(intersectingCoordinate).to.be.an('Array').of.length(2)
            expect(intersectingCoordinate).to.eql([TILEGRID_EXTENT_EPSG_3857[0], yValue])
            // next chunk must start by the intersecting coordinate
            expect(inBoundChunk).to.haveOwnProperty('isWithinLV95Bounds')
            expect(inBoundChunk.isWithinLV95Bounds).to.be.true
            expect(inBoundChunk.coordinates).to.be.an('Array').of.length(6)
            const [firstInBoundCoordinate] = inBoundChunk.coordinates
            expect(firstInBoundCoordinate).to.be.an('Array').of.length(2)
            expect(firstInBoundCoordinate).to.eql([TILEGRID_EXTENT_EPSG_3857[0], yValue])
            // checking that further coordinates have been correctly copied
            coordinatesOverlappingSwissBounds.slice(1).forEach((coordinate, index) => {
                expect(inBoundChunk.coordinates[index + 1][0]).to.eq(coordinate[0])
                expect(inBoundChunk.coordinates[index + 1][1]).to.eq(coordinate[1])
            })
        })
        it('handles properly a linestring going multiple times out of LV95 bounds', () => {
            const coordinatesGoingBackAndForth = [
                [500000, 6000000], // outside
                [800000, 6000000], // inside
                [800000, 500000], // outside
                [700000, 500000], // outside
                [700000, 6000000], // inside
                [1000000, 6000000], // inside
            ]
            const expectedFirstIntersection = [TILEGRID_EXTENT_EPSG_3857[0], 6000000]
            const expectedSecondIntersection = [800000, TILEGRID_EXTENT_EPSG_3857[1]]
            const expectedThirdIntersection = [700000, TILEGRID_EXTENT_EPSG_3857[1]]

            const result = splitIfOutOfLV95Bounds(coordinatesGoingBackAndForth)
            expect(result).to.be.an('Array').of.length(4)
            const [firstChunk, secondChunk, thirdChunk, fourthChunk] = result
            // first chunk should have 2 coordinates, the first from the list and the first intersection
            expect(firstChunk.coordinates).to.be.an('Array').of.length(2)
            expect(firstChunk.coordinates[0]).to.eql(coordinatesGoingBackAndForth[0])
            expect(firstChunk.coordinates[1]).to.eql(expectedFirstIntersection)
            // second chunk should start with the first intersection, then include the second coord
            // and finish with the second intersection
            expect(secondChunk.coordinates).to.be.an('Array').of.length(3)
            expect(secondChunk.coordinates[0]).to.eql(expectedFirstIntersection)
            expect(secondChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[1])
            expect(secondChunk.coordinates[2]).to.eql(expectedSecondIntersection)
            // third chunk should be : intersection2, coord3, coord4, intersection3
            expect(thirdChunk.coordinates).to.be.an('Array').of.length(4)
            expect(thirdChunk.coordinates[0]).to.eql(expectedSecondIntersection)
            expect(thirdChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[2])
            expect(thirdChunk.coordinates[2]).to.eql(coordinatesGoingBackAndForth[3])
            expect(thirdChunk.coordinates[3]).to.eql(expectedThirdIntersection)
            // last chunk should be : intersection3, coord5, coord6
            expect(fourthChunk.coordinates).to.be.an('Array').of.length(3)
            expect(fourthChunk.coordinates[0]).to.eql(expectedThirdIntersection)
            expect(fourthChunk.coordinates[1]).to.eql(coordinatesGoingBackAndForth[4])
            expect(fourthChunk.coordinates[2]).to.eql(coordinatesGoingBackAndForth[5])
        })
    })
})
