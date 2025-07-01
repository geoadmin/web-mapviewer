import type { SingleCoordinate } from '@geoadmin/coordinates'

import {
    CoordinateSystem,
    CoordinateSystemBounds,
    LV03,
    LV95,
    WEBMERCATOR,
    WGS84,
} from '@geoadmin/coordinates'

import { toPoint as mgrsToWGS84 } from '@/utils/militaryGridProjection'

const RE_DEGREE_IDENTIFIER = '\\s*°\\s*'
const RE_DEGREE = `\\d{1,3}(\\.\\d+)?`
const RE_MIN_IDENTIFIER = "\\s*['‘’‛′]\\s*"
const RE_MIN = `\\d{1,2}(\\.\\d+)?`
const RE_SEC_IDENTIFIER = '\\s*(["“”‟″]|[\'‘’‛′]{2})\\s*'
const RE_SEC = `\\d{1,2}(\\.\\d+)?`
const RE_CARD = '[NSEW]'
const RE_SEPARATOR = '\\s*?[ \\t,/]\\s*'

// 47.5 7.5 or 47.5° 7.5°
const REGEX_WGS_84 = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?$`,
    'i'
)
// 47.5N 7.5E or 47.5°N 7.5°E
const REGEX_WGS_84_WITH_CARDINALS = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `\\s*(?<card1>${RE_CARD})` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `\\s*(?<card2>${RE_CARD})$`,
    'i'
)
// N47.5 E7.5 or N47.5 E7.5
const REGEX_WGS_84_WITH_PRE_FIXED_CARDINALS = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER})?$`,
    'i'
)
// 47°31.8' 7°31.8' or 47°31.8' 7°31.8' or 47°31.8'30"N 7°31.8'30.4"E or 47°31.8'N 7°31.8'E or without °'" 47 31.8 30 N 7 31.8 30.4 E
const REGEX_WGS_84_WITH_MIN = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `(\\s*(?<card1>${RE_CARD}))?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `(\\s*(?<card2>${RE_CARD}))?$`,
    'i'
)
// N47°31.8' E7°31.8'or without °'" N 47 31.8 E 7 31.8
const REGEX_WGS_84_WITH_MIN_PREFIXED = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER})?$`,
    'i'
)
// 47°31.8'30" 7°31.8'30.4" or 47°31.8'30"N 7°31.8'30.4"E or without °'" 47 31.8 30 N 7 31.8 30.4 E
const REGEX_WGS_84_WITH_SECONDS = new RegExp(
    `^(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec1>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `(\\s*(?<card1>${RE_CARD}))?` +
        `${RE_SEPARATOR}` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec2>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `(\\s*(?<card2>${RE_CARD}))?$`,
    'i'
)
// same as REGEX_WGS_84_WITH_SECONDS but with prefixed cardinal: N 47°31.8'30" E 7°31.8'30.4"
const REGEX_WGS_84_WITH_SECONDS_PREFIXED = new RegExp(
    `^(?<card1>${RE_CARD})\\s*` +
        `(?<degree1>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min1>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec1>${RE_SEC})(${RE_SEC_IDENTIFIER})?` +
        `${RE_SEPARATOR}` +
        `(?<card2>${RE_CARD})\\s*` +
        `(?<degree2>${RE_DEGREE})(${RE_DEGREE_IDENTIFIER}|\\s+)(?<min2>${RE_MIN})(${RE_MIN_IDENTIFIER}|\\s+)(?<sec2>${RE_SEC})(${RE_SEC_IDENTIFIER})?$`,
    'i'
)

function extractWGS84Coordinates(text: string): SingleCoordinate | undefined {
    const regexMatch = [
        REGEX_WGS_84,
        REGEX_WGS_84_WITH_CARDINALS,
        REGEX_WGS_84_WITH_PRE_FIXED_CARDINALS,
        REGEX_WGS_84_WITH_MIN,
        REGEX_WGS_84_WITH_MIN_PREFIXED,
        REGEX_WGS_84_WITH_SECONDS,
        REGEX_WGS_84_WITH_SECONDS_PREFIXED,
    ]
        .map((regex) => regex.exec(text.trim()))
        .find((result) => Array.isArray(result))
    if (regexMatch) {
        return wgs84Extractor(regexMatch)
    }
    return undefined
}

const thousandSeparatorRegex = /['`’´ ]/g
// LV95, LV03, metric WebMercator (EPSG:3857)
const REGEX_METRIC_COORDINATES = new RegExp(
    `^(?<coord1>\\d{1,3}(${thousandSeparatorRegex.source}?\\d{3})*(\\.\\d+)?)\\s*[,/ \\t]\\s*(?<coord2>\\d{1,3}(${thousandSeparatorRegex.source}?\\d{3})*(\\.\\d+)?)$`,
    'i'
)

function extractLV95Coordinates(text: string): SingleCoordinate | undefined {
    const coordinates = numericalExtractor(REGEX_METRIC_COORDINATES.exec(text.trim()))
    if (coordinates) {
        if (LV95.isInBounds(coordinates[0], coordinates[1])) {
            return [
                LV95.roundCoordinateValue(coordinates[0]),
                LV95.roundCoordinateValue(coordinates[1]),
            ]
        } else if (LV95.isInBounds(coordinates[1], coordinates[0])) {
            return [
                LV95.roundCoordinateValue(coordinates[1]),
                LV95.roundCoordinateValue(coordinates[0]),
            ]
        }
    }
    return undefined
}

function extractLV03Coordinates(text: string): SingleCoordinate | undefined {
    const coordinates = numericalExtractor(REGEX_METRIC_COORDINATES.exec(text.trim()))
    if (coordinates) {
        if (LV03.isInBounds(coordinates[0], coordinates[1])) {
            return [
                LV03.roundCoordinateValue(coordinates[0]),
                LV03.roundCoordinateValue(coordinates[1]),
            ]
        } else if (LV03.isInBounds(coordinates[1], coordinates[0])) {
            return [
                LV03.roundCoordinateValue(coordinates[1]),
                LV03.roundCoordinateValue(coordinates[0]),
            ]
        }
    }
    return undefined
}

function extractMetricMercatorCoordinates(text: string): SingleCoordinate | undefined {
    const coordinates = numericalExtractor(REGEX_METRIC_COORDINATES.exec(text.trim()))
    if (coordinates) {
        if (LV95_BOUNDS_IN_METRIC_MERCATOR.isInBounds(coordinates[0], coordinates[1])) {
            return [
                WEBMERCATOR.roundCoordinateValue(coordinates[0]),
                WEBMERCATOR.roundCoordinateValue(coordinates[1]),
            ]
        } else if (LV95_BOUNDS_IN_METRIC_MERCATOR.isInBounds(coordinates[1], coordinates[0])) {
            return [
                WEBMERCATOR.roundCoordinateValue(coordinates[1]),
                WEBMERCATOR.roundCoordinateValue(coordinates[0]),
            ]
        }
    }
    return undefined
}

// Military Grid Reference System (MGRS) (e.g. 32TMS 40959 89723)
const REGEX_MILITARY_GRID = /^3[123]\s*[a-z]{3}\s*\d{1,5}\s*\d{1,5}$/i

function extractMGRSCoordinates(text: string): SingleCoordinate | undefined {
    const coordinate = mgrsExtractor(REGEX_MILITARY_GRID.exec(text.trim()))
    if (coordinate) {
        return coordinate
    }
    return undefined
}

const LV95_BOUNDS_IN_WGS84 = LV95.getBoundsAs(WGS84) as CoordinateSystemBounds
const LV95_BOUNDS_IN_METRIC_MERCATOR = LV95.getBoundsAs(WEBMERCATOR) as CoordinateSystemBounds

const numericalExtractor = (regexMatches: RegExpExecArray | null): SingleCoordinate | undefined => {
    if (!regexMatches || !regexMatches.groups) {
        return undefined
    }
    // removing thousand separators
    const x = Number(regexMatches.groups.coord1.replace(thousandSeparatorRegex, ''))
    const y = Number(regexMatches.groups.coord2.replace(thousandSeparatorRegex, ''))
    if (Number.isNaN(x) || Number.isNaN(y)) {
        return undefined
    }
    return [x, y]
}

const wgs84Extractor = (regexMatches: RegExpExecArray | null): SingleCoordinate | undefined => {
    if (!regexMatches || !regexMatches.groups) {
        return undefined
    }
    let firstNumber, secondNumber
    let firstCardinal, secondCardinal

    // Extract degrees
    firstNumber = Number(regexMatches.groups.degree1)
    secondNumber = Number(regexMatches.groups.degree2)

    // Extract minutes if any
    if (regexMatches.groups.min1) {
        firstNumber += Number(regexMatches.groups.min1) / 60
    }
    if (regexMatches.groups.min2) {
        secondNumber += Number(regexMatches.groups.min2) / 60
    }

    // Extract seconds if any
    if (regexMatches.groups.sec1) {
        firstNumber += Number(regexMatches.groups.sec1) / 3600
    }
    if (regexMatches.groups.sec2) {
        secondNumber += Number(regexMatches.groups.sec2) / 3600
    }

    // Extract cardinal if any
    if (regexMatches.groups.card1) {
        firstCardinal = regexMatches.groups.card1
    }
    if (regexMatches.groups.card2) {
        secondCardinal = regexMatches.groups.card2
    }

    if (firstNumber && secondNumber) {
        let lon = firstNumber,
            lat = secondNumber
        switch (firstCardinal?.toUpperCase()) {
            case 'N':
                lat = firstNumber
                break
            case 'S':
                lat = -firstNumber
                break
            case 'E':
                lon = firstNumber
                break
            case 'W':
                lon = -firstNumber
                break
        }
        switch (secondCardinal?.toUpperCase()) {
            case 'N':
                lat = secondNumber
                break
            case 'S':
                lat = -secondNumber
                break
            case 'E':
                lon = secondNumber
                break
            case 'W':
                lon = -secondNumber
                break
        }
        if (LV95_BOUNDS_IN_WGS84.isInBounds(lon, lat)) {
            return [WGS84.roundCoordinateValue(lon), WGS84.roundCoordinateValue(lat)]
        }
        if (LV95_BOUNDS_IN_WGS84.isInBounds(lat, lon)) {
            return [WGS84.roundCoordinateValue(lat), WGS84.roundCoordinateValue(lon)]
        }
    }
    return undefined
}

// copied from https://github.com/geoadmin/mf-geoadmin3/blob/f421edcbb216d6a7e27e483b504616d99a475d0b/src/components/search/SearchService.js#L122
// Grid zone designation for Switzerland + two 100km letters + two digits
// It's a limitation of proj4 and a sensible default (precision is 10km)
const MGRSMinimalPrecision = 7

const mgrsExtractor = (regexMatches: RegExpExecArray | null): SingleCoordinate | undefined => {
    if (!regexMatches) {
        return undefined
    }
    const mgrsString = regexMatches[0].split(' ').join('')
    if ((mgrsString.length - MGRSMinimalPrecision) % 2 === 0) {
        const coordinates = mgrsToWGS84(mgrsString)
        return [
            WGS84.roundCoordinateValue(coordinates[0]),
            WGS84.roundCoordinateValue(coordinates[1]),
        ]
    }
    return undefined
}

export interface ExtractedCoordinate {
    coordinateSystem: CoordinateSystem
    coordinate: SingleCoordinate
}

/**
 * Extracts (if possible) a set of coordinates from the text as an array. The text must contain only
 * coordinates and nothing else, otherwise undefined will be returned.
 *
 * E.G. `'47.1, 7.5'` is valid and will return `[47.1, 7.5]` but `'lat:47.1, lon:7.5'` will fail and
 * return `undefined`.
 *
 * **Separators**
 *
 * To separate the two numerical values, a combination of slashes, spaces (tabs included) or a coma
 * can be used.
 *
 * **Accepted formats**
 *
 * CH1903+ / LV95 :
 *
 * - With or without thousands separator (`2'600'000 1'200'000` or `2600000 1200000`)
 *
 * CH1903 / LV03 :
 *
 * - With or without thousands separator (`600'000 200'000` or `600000 200000`)
 *
 * WGS84:
 *
 * - Numerical (`46.97984 6.60757`)
 * - DegreesMinutes (`46°58.7904' 6°36.4542'`)
 * - DegreesMinutesSeconds, double single quote for seconds (`46°58'47.424'' 6°36'27.252''`)
 * - DegreesMinutesSeconds, double quote for seconds (`46°58'47.424" 6°36'27.252"`)
 * - Google style is also supported (any format above without degrees, minutes and seconds symbol)
 *
 * Military Grid Reference System (MGRS):
 *
 * - I.e. `32TLT 98757 23913`
 *
 * What3words:
 *
 * - I.e. `zufall.anders.blaumeise`
 *
 * @param text The text in which we want to find coordinates
 * @returns Coordinates in the given order in text with information about which projection they are
 *   expressed in, or `undefined` if nothing was found
 */
const coordinateFromString = (text: string): ExtractedCoordinate | undefined => {
    if (!text) {
        return undefined
    }
    const wgs84Result = extractWGS84Coordinates(text)
    if (wgs84Result) {
        return {
            coordinateSystem: WGS84,
            coordinate: wgs84Result,
        }
    }
    const lv95Result = extractLV95Coordinates(text)
    if (lv95Result) {
        return {
            coordinateSystem: LV95,
            coordinate: lv95Result,
        }
    }
    const lv03Result = extractLV03Coordinates(text)
    if (lv03Result) {
        return {
            coordinateSystem: LV03,
            coordinate: lv03Result,
        }
    }
    const mercatorResult = extractMetricMercatorCoordinates(text)
    if (mercatorResult) {
        return {
            coordinateSystem: WEBMERCATOR,
            coordinate: mercatorResult,
        }
    }
    const mgrsResult = extractMGRSCoordinates(text)
    if (mgrsResult) {
        return {
            coordinateSystem: WGS84,
            coordinate: mgrsResult,
        }
    }
    return undefined
}

export default coordinateFromString
