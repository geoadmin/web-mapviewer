import proj4 from "proj4";

import {round} from "@/utils/numberUtils";

import { toPoint as mgrsToWGS84 } from "./militaryGridProjection"

// 47.5 7.5
const REGEX_WEB_MERCATOR = /^\s*([\d]{1,3}[.\d]+)\s*[ ,\/]+\s*([\d]{1,3}[.\d]+)\s*$/i; // eslint-disable-line no-useless-escape
// 47°31.8' 7°31.8'
const REGEX_MERCATOR_WITH_DEGREES = /^\s*([\d]{1,3})°\s*([\d.,]+)'\s*[,/]?\s*([\d]{1,3})°\s*([\d.,]+)'\s*$/i;
// 47°38'48'' 7°38'48'' or 47°38'48" 7°38'48"
const REGEX_MERCATOR_WITH_DEGREES_MINUTES = /^\s*([\d]{1,3})°\s*([\d]{1,2})'\s*([\d.]+)['"]+\s*[,/]?\s*([\d]{1,3})°\s*([\d.]+)'\s*([\d.]+)['"]+\s*$/i;

// LV95, LV03, metric WebMercator (EPSG:3857)
const REGEX_METRIC_COORDINATES = /^\s*([\d]{1,3}[ ']?[\d]{1,3}[ ']?[\d.]{3,})[\t ,./]+([\d]{1,3}[ ']?[\d]{1,3}[ ']?[\d.]{3,})/i;

// Military Grid Reference System (MGRS)
const REGEX_MILITARY_GRID = /^3[123][\sa-z]{3}[\s\d]*/i;

const LV95_BOUNDS = {
    x: {
        lower: 2485071.58,
        upper: 2828515.82,
    },
    y: {
        lower: 1075346.31,
        upper: 1299941.79,
    },
};
const LV03_BOUNDS = {
    x: {
        lower: 485071.54,
        upper: 828515.78,
    },
    y: {
        lower: 75346.36,
        upper: 299941.84,
    },
};

const numericalExtractor = regexMatches => {
    // removing thousand separators
    const x = Number(regexMatches[1].replace(/[' ]/g, ''));
    const y = Number(regexMatches[2].replace(/[' ]/g, ''));
    if (Number.isNaN(x) || Number.isNaN(y)) {
        return undefined;
    }
    // guessing if this is already WGS84 or a Swiss projection (if so we need to reproject it to WGS84)
    // checking LV95 bounds
    if (x > LV95_BOUNDS.x.lower && x < LV95_BOUNDS.x.upper && y > LV95_BOUNDS.y.lower && y < LV95_BOUNDS.y.upper) {
        return proj4('EPSG:2056', proj4.WGS84, [x, y]);
    // checking LV95 backward
    } else if (y > LV95_BOUNDS.x.lower && y < LV95_BOUNDS.x.upper && x > LV95_BOUNDS.y.lower && x < LV95_BOUNDS.y.upper) {
        return proj4('EPSG:2056', proj4.WGS84, [y, x]);
    // checking LV03 bounds
    } else if (x > LV03_BOUNDS.x.lower && x < LV03_BOUNDS.x.upper && y > LV03_BOUNDS.y.lower && y < LV03_BOUNDS.y.upper) {
        return proj4('EPSG:21781', proj4.WGS84, [x, y]);
    // checking LV03 backward
    } else if (y > LV03_BOUNDS.x.lower && y < LV03_BOUNDS.x.upper && x > LV03_BOUNDS.y.lower && x < LV03_BOUNDS.y.upper) {
        return proj4('EPSG:21781', proj4.WGS84, [y, x]);
    }
    // if nothing has been detected, we let it go "as is", it should be WGS84 already (we inverse lat/lon to lon/lat
    // as user inputs support lat/lon but the app behind function with lon/lat coordinates, especially proj4js)
    return [y, x];
}

const webmercatorExtractor = regexMatches => {
    switch(regexMatches.length) {
        case 3: // 2 matches + global match i.e. : (45.12), (7.12)
            return numericalExtractor(regexMatches)
        case 5: // 4 matches + global match, i.e. : (47)°(5.123)', (8)°(4.154)' (we inverse lat/lon to lon/lat in the process)
            return [
                Number(regexMatches[3]) + Number(regexMatches[4]) / 60.0,
                Number(regexMatches[1]) + Number(regexMatches[2]) / 60.0,
            ]
        case 7: // 6 matches + global match, i.e. : (47)°(5)'(41.61)", (8)°(4)'(6.32)" (we inverse lat/lon to lon/lat in the process)
            return [
                Number(regexMatches[4]) + Number(regexMatches[5]) / 60.0 + Number(regexMatches[6]) / 3600.0,
                Number(regexMatches[1]) + Number(regexMatches[2]) / 60.0 + Number(regexMatches[3]) / 3600.0,
            ]
    }
    return null;
}

// copied from https://github.com/geoadmin/mf-geoadmin3/blob/f421edcbb216d6a7e27e483b504616d99a475d0b/src/components/search/SearchService.js#L122
// Grid zone designation for Switzerland + two 100km letters + two digits
// It's a limitation of proj4 and a sensible default (precision is 10km)
const MGRSMinimalPrecision = 7;
const mgrsExtractor = regexMatches => {
    const mgrsString = regexMatches[0].split(' ').join('');
    if ((mgrsString.length - MGRSMinimalPrecision) % 2 === 0) {
        return mgrsToWGS84(mgrsString);
    }
    return null;
}

const executeAndReturn = (regex, text, extractor = numericalExtractor, outputProjection, decimals) => {
    if (typeof text !== 'string') return undefined;
    const matches = regex.exec(text);
    if (matches) {
        const projectedResult = proj4(proj4.WGS84, outputProjection, extractor(matches));
        return [
            round(projectedResult[0], decimals),
            round(projectedResult[1], decimals)
        ]
    }
    return undefined;
}

/**
 * Extracts (if possible) a set of coordinates from the text as an array. The text must contains only a coordinates
 * and nothing else, otherwise undefined will be returned.
 *
 * E.G. `'47.1, 7.5'` is valid and will return `[47.1, 7.5]` but `'lat:47.1, lon:7.5'` will fail and return `undefined`.
 *
 * Separators
 * ----------
 * To separates the two numerical values, a combination of slashes, spaces (tabs included) or a coma can be used.
 *
 * Accepted formats
 * ----------------
 *  **CH1903+ / LV95**
 *   - with or without thousand separator (`2'600'000 1'200'000` or `2600000 1200000`)
 *
 *  **CH1903 / LV03**
 *    - with or without thousand separator (`600'000 200'000` or `600000 200000`)
 *
 *  **WGS84 (Web Mercator)**
 *    - numerical (`46.97984 6.60757`)
 *    - DegreesMinutes (`46°58.7904' 6°36.4542'`)
 *    - DegreesMinutesSeconds, double single quote for seconds (`46°58'47.424'' 6°36'27.252''`)
 *    - DegreesMinutesSeconds, double quote for seconds (`46°58'47.424" 6°36'27.252"`)
 *
 *  **Military Grid Reference System (MGRS)**
 *    - i.e. `32TLT 98757 23913`
 *
 *  **what3words**
 *    - i.e. `zufall.anders.blaumeise`
 *
 * @param {String} text the text in which we want to find coordinates
 * @param {String} toProjection projection wanted for the output coordinates (default: EPSG:3857)
 * @param {Number} roundingToDecimal how many decimals should stay in the final coordinates (default: 1)
 * @returns {Array<Number>} coordinates in the given order in text in the wanted projection, or `undefined` if nothing was found
 */
export const coordinateFromString = (text, toProjection = 'EPSG:3857', roundingToDecimal = 1) => {
    if (typeof text !== 'string') {
        return undefined;
    }
    return [
        { regex: REGEX_WEB_MERCATOR, extractor: webmercatorExtractor },
        { regex: REGEX_METRIC_COORDINATES, extractor: numericalExtractor },
        { regex: REGEX_MERCATOR_WITH_DEGREES, extractor: webmercatorExtractor },
        { regex: REGEX_MERCATOR_WITH_DEGREES_MINUTES, extractor: webmercatorExtractor },
        { regex: REGEX_MILITARY_GRID, extractor: mgrsExtractor },
    ].map(config => {
        return executeAndReturn(config.regex,
                                text.replace(/\t/, ' '),
                                config.extractor,
                                toProjection,
                                roundingToDecimal)
    }).find(result => Array.isArray(result));
}
