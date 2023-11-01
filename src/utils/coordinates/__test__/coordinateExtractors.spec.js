import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { expect } from 'chai'
import { toStringHDMS } from 'ol/coordinate'
import proj4 from 'proj4'
import { describe, it } from 'vitest'

/**
 * Place a separator after each group of 3 digit
 *
 * @param {Number} number A number expressed as a string
 * @param {String} separator Which thousands separator to use
 * @returns {string} The number with thousands separator
 */
const numberWithThousandSeparator = (number, separator = "'") => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

describe('Unit test functions from coordinateExtractors.js', () => {
    describe('coordinateFromString(text)', () => {
        /**
         * Gives text as input to coordinateFromString and check the output of this function
         *
         * @param {String} text The input to be given to coordinateFromString
         * @param {Number[]} expected What is expected of coordinateFromString as output
         * @param {String} message Message to be shown if the test fails (in the unit test log)
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable
         *   (default is zero)
         * @param {CoordinateSystem} projection Which projection is the output of the parsing
         */
        const checkText = (text, expected, message, acceptableDelta = 0, projection) => {
            const result = coordinateFromString(text, projection)
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
         * combinations of coma, spaces, slash and tabs in between X and Y
         *
         * @param {Number, String} x X to be passed as input to coordinateFromString
         * @param {Number, String} y Y to be passed as input to coordinateFromString
         * @param {Number} xExpectedValue What coordinateFromString is expected to output as X
         * @param {Number} yExpectedValue What coordinateFromString is expected to output as Y
         * @param {CoordinateSystem} projection The output projection of the parsing
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable
         *   (default is zero)
         */
        const checkXY = (x, y, xExpectedValue, yExpectedValue, projection, acceptableDelta = 0) => {
            const valueOutputInCaseOfErr = `x: ${x}, y: ${y}, expected x: ${xExpectedValue}, expected y: ${yExpectedValue}`
            // checking with simple space and tab
            checkText(
                `${x} ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space in between\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x}\t${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with tabs\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            // checking while placing separators with and without spaces before/after
            checkText(
                `${x},${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with coma\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x} ,${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space and coma\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x}, ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with coma and space\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x} , ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space, coma and space\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x}/${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with slash\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x} /${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space and slash\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x}/ ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with slash and space\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
            checkText(
                `${x} / ${y}`,
                [xExpectedValue, yExpectedValue],
                'fails with space, slash and space\n' + valueOutputInCaseOfErr,
                acceptableDelta,
                projection
            )
        }

        const expectedCenterLV95 = LV95.bounds.center
        const expectedCenterWGS84 = proj4(LV95.epsg, WGS84.epsg, expectedCenterLV95).map((value) =>
            WGS84.roundCoordinateValue(value)
        )

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
            const acceptableDelta = 0.2

            const expectedCenterWGS84_DD = expectedCenterWGS84.map((val) => {
                const [degree, minutesFraction] = `${val}`.split('.')
                const minutes = parseFloat(`0.${minutesFraction}`)
                return `${degree}° ${(minutes * 60.0).toFixed(4)}'`
            })
            const expectedCenterWGS84_DD_NoSymbol = expectedCenterWGS84_DD.map((val) =>
                val.replace(/[°']/g, '')
            )

            const dmsString = toStringHDMS(expectedCenterWGS84, 2)
                .replace(/′/g, "'")
                .replace(/″/g, '"')
            const expectedCenterWGS84_DMS = [
                dmsString.slice(dmsString.indexOf('N') + 1, dmsString.length).trim(),
                dmsString.slice(0, dmsString.indexOf('N') + 1).trim(),
            ]
            const expectedCenterWGS84_DMS_No_NE = expectedCenterWGS84_DMS.map((val) =>
                val.replace(/[NE]/g, '').trim()
            )
            const expectedCenterWGS84_DMS_NoSymbol = expectedCenterWGS84_DMS_No_NE.map((val) =>
                val.replace(/[°'"]/g, '')
            )

            it('Returns coordinates with degree decimal (DD) format', () => {
                checkXY(
                    expectedCenterWGS84_DD[0],
                    expectedCenterWGS84_DD[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it('Returns coordinates with DM (degree/minutes) format', () => {
                checkXY(
                    expectedCenterWGS84_DMS[0],
                    expectedCenterWGS84_DMS[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                // removing space between degrees and minutes
                checkXY(
                    ...expectedCenterWGS84_DMS.map((val) => val.replace(/° /g, '°')),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                // removing space between minutes and seconds
                checkXY(
                    ...expectedCenterWGS84_DMS.map((val) => val.replace(/' /g, "'")),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                // removing space between degrees, minutes and seconds
                checkXY(
                    ...expectedCenterWGS84_DMS.map((val) =>
                        val.replace(/° /g, '°').replace(/' /g, "'")
                    ),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it('Returns coordinates with DMS (degree/minutes/seconds) format', () => {
                const latWithSpaceBetweenDegAndMin = expectedCenterWGS84_DMS_No_NE[0].replace(
                    /°/g,
                    '° '
                )
                const lonWithSpaceBetweenDegAndMin = expectedCenterWGS84_DMS_No_NE[1].replace(
                    /°/g,
                    '° '
                )

                const latWithSpaceBetweenDegAndMinAndSec = latWithSpaceBetweenDegAndMin.replace(
                    /'/g,
                    "' "
                )
                const lonWithSpaceBetweenDegAndMinAndSec = lonWithSpaceBetweenDegAndMin.replace(
                    /'/g,
                    "' "
                )

                // double quote notation for seconds
                checkXY(
                    expectedCenterWGS84_DMS_No_NE[0],
                    expectedCenterWGS84_DMS_No_NE[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMin,
                    lonWithSpaceBetweenDegAndMin,
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMinAndSec,
                    lonWithSpaceBetweenDegAndMinAndSec,
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )

                // two single quote notation for seconds
                checkXY(
                    expectedCenterWGS84_DMS_No_NE[0].replace(/"/g, "''"),
                    expectedCenterWGS84_DMS_No_NE[1].replace(/"/g, "''"),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMin.replace(/"/g, "''"),
                    lonWithSpaceBetweenDegAndMin.replace(/"/g, "''"),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    latWithSpaceBetweenDegAndMinAndSec.replace(/"/g, "''"),
                    lonWithSpaceBetweenDegAndMinAndSec.replace(/"/g, "''"),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it('Returns coordinate with DM format (degree minutes without symbols, aka Google style)', () => {
                checkXY(
                    expectedCenterWGS84_DD_NoSymbol[0],
                    expectedCenterWGS84_DD_NoSymbol[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format (degree minutes without symbols, aka Google style)', () => {
                checkXY(
                    expectedCenterWGS84_DMS_NoSymbol[0],
                    expectedCenterWGS84_DMS_NoSymbol[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it('Returns coordinate with DMS format with cardinal point information', () => {
                checkXY(
                    expectedCenterWGS84_DMS[0],
                    expectedCenterWGS84_DMS[1],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    expectedCenterWGS84_DMS[1],
                    expectedCenterWGS84_DMS[0],
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
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
                    WEBMERCATOR,
                    acceptableDelta
                )
                checkXY(
                    pointInSouthAmericaInEPSG4326[1],
                    pointInSouthAmericaInEPSG4326[0],
                    pointInSouthAmericaInEPSG3857[0],
                    pointInSouthAmericaInEPSG3857[1],
                    WEBMERCATOR,
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
                    WEBMERCATOR,
                    acceptableDelta
                )
                checkXY(
                    pointInNorthAmericaInEPSG4326[1],
                    pointInNorthAmericaInEPSG4326[0],
                    pointInNorthAmericaInEPSG3857[0],
                    pointInNorthAmericaInEPSG3857[1],
                    WEBMERCATOR,
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
                    WEBMERCATOR,
                    acceptableDelta
                )
                checkXY(
                    pointInOceaniaInEPSG4326[1],
                    pointInOceaniaInEPSG4326[0],
                    pointInOceaniaInEPSG3857[0],
                    pointInOceaniaInEPSG3857[1],
                    WEBMERCATOR,
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
                checkXY(x, y, expectedCenterLV95[0], expectedCenterLV95[1], LV95, acceptableDelta)
            })
            it('Returns coordinates when input is entered backward', () => {
                checkXY(y, x, expectedCenterLV95[0], expectedCenterLV95[1], LV95, acceptableDelta)
            })
            it("Returns coordinates when there's thousands separator", () => {
                checkXY(
                    numberWithThousandSeparator(x),
                    numberWithThousandSeparator(y),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    numberWithThousandSeparator(x, ' '),
                    numberWithThousandSeparator(y, ' '),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
            it("Returns coordinates when there's thousands separator and input is entered backward", () => {
                checkXY(
                    numberWithThousandSeparator(y),
                    numberWithThousandSeparator(x),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
                checkXY(
                    numberWithThousandSeparator(y, ' '),
                    numberWithThousandSeparator(x, ' '),
                    expectedCenterLV95[0],
                    expectedCenterLV95[1],
                    LV95,
                    acceptableDelta
                )
            })
        }

        describe('EPSG:2056 (LV95)', () => {
            checkSwissCoordinateSystem(expectedCenterLV95[0], expectedCenterLV95[1], 0.1)
        })

        describe('EPSG:21781 (LV03)', () => {
            const expectedCenterLV03 = proj4(LV95.epsg, LV03.epsg, expectedCenterLV95).map(
                (value) => LV03.roundCoordinateValue(value)
            )
            checkSwissCoordinateSystem(expectedCenterLV03[0], expectedCenterLV03[1], 0.1)
        })

        describe('Military Grid Reference System (MGRS)', () => {
            // converting LV95's center with tool from https://www.earthpoint.us/Convert.aspx
            const MGRS = '32TMS 40959 89723'
            it('Returns coordinates in EPSG:4326 when MGRS string is entered', () => {
                // as MGRS is a grid based system, what is return is essentially a 1-meter box.
                // So depending on which part of the box is taken, the answer is correct, we then tolerate here a margin of 1m
                checkText(MGRS, LV95.bounds.center, 'MGRS not supported', 1, LV95)
            })
        })
    })
})
