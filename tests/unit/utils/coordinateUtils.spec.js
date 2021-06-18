import { expect } from 'chai'
import { coordinateFromString } from '@/utils/coordinateUtils'
import setupProj4 from '@/utils/setupProj4'

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
    context('coordinateFromString(text)', () => {
        /**
         * Gives text as input to coordinateFromString and check the output of this function
         *
         * @param {String} text The input to be given to coordinateFromString
         * @param {Number[]} expected What is expected of coordinateFromString as output
         * @param {String} message Message to be shown if the test fails (in the unit test log)
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable (default is zero)
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
         * @param {Number} acceptableDelta If a delta with the expected result is acceptable (default is zero)
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

        // values (in EPSG:3857) used throughout next tests
        const EPSG3857 = [773900, 5976445]

        context('Testing non valid inputs', () => {
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
        context('EPSG:4326 (WGS84)', () => {
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

        context('EPSG:2056 (LV95)', () => {
            // same place as [x,y] (used https://epsg.io for transformations)
            const LV95 = [2563138.69, 1228917.22]
            checkSwissCoordinateSystem(LV95[0], LV95[1], 0.1)
        })

        context('EPSG:21781 (LV03)', () => {
            // same place as [x,y] (used https://epsg.io for transformations)
            const LV03 = [563138.65, 228917.28]
            checkSwissCoordinateSystem(LV03[0], LV03[1], 0.1)
        })

        context('Military Grid Reference System (MGRS)', () => {
            // value from https://www.earthpoint.us/Convert.aspx
            const MGRS = '32TLT 44918 30553'
            it('Returns coordinates in EPSG:4326 when MGRS string is entered', () => {
                // as MGRS is a grid based system, what is return is essentially a 1 meter box.
                // So depending which part of the box is taken, the answer is correct, we then tolerate here a margin of 1m
                checkText(MGRS, EPSG3857, 'MGRS not supported', 1)
            })
        })
    })
})
