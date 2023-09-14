import proj4 from 'proj4'
import log from '../logging'
import { formatThousand } from '../numberUtils'
import { LV03, LV95, WEBMERCATOR, WGS84 } from './coordinateSystems'

/**
 * Attempts to re-project given coordinates to WebMercator (WGS84). Will return a tuple containing
 * [lat, lon] even if input is given as [lon, lat] (as this is what OpenLayers wants to be fed.
 *
 * This function supports input from LV95, LV03 or WebMercator input (no other projection supported)
 *
 * @param x {Number} X part of the coordinate (Easting/Longitude)
 * @param y {Number} Y part of the coordinate (Northing/Latitude)
 * @returns {Number[]} Re-projected coordinate as [lat, lon], or undefined if the input was not
 *   convertible to WebMercator
 */
export const reprojectUnknownSrsCoordsToWebMercator = (x, y) => {
    if (LV95.getBoundsAs(WEBMERCATOR)?.isInBounds(x, y)) {
        return proj4(WEBMERCATOR.epsg, WGS84.epsg, [x, y])
        // guessing if this is already WGS84 or a Swiss projection (if so we need to reproject it to WGS84)
        // checking LV95 bounds
    } else if (LV95.isInBounds(x, y)) {
        return proj4(LV95.epsg, WGS84.epsg, [x, y])
        // checking LV95 backward
    } else if (LV95.isInBounds(y, x)) {
        return proj4(LV95.epsg, WGS84.epsg, [y, x])
        // checking LV03 bounds
    } else if (LV03.isInBounds(x, y)) {
        return proj4(LV03.epsg, WGS84.epsg, [x, y])
        // checking LV03 backward
    } else if (LV03.isInBounds(y, x)) {
        return proj4(LV03.epsg, WGS84.epsg, [y, x])
        // checking for WGS84 bounds
    } else if (WGS84.isInBounds(x, y)) {
        // we inverse lat/lon to lon/lat as user inputs support lat/lon but the app behind function with lon/lat
        // coordinates, especially proj4js
        return [y, x]
    } else if (WGS84.isInBounds(y, x)) {
        // if it's already a lat/lon we return it as is
        return [x, y]
    } else {
        log.debug(`Unknown coordinate type [${x}, ${y}]`)
        return undefined
    }
}

/**
 * Returns rounded coordinate with thousands separator and comma.
 *
 * @param {[Number, Number]} coordinate The raw coordinate as array.
 * @param {Number} digits Decimal digits to round to.
 * @param {Boolean} withThousandsSeparator If thousands should be separated with a single quote character
 * @returns {String} Formatted coordinate.
 * @see https://stackoverflow.com/a/2901298/4840446
 */
export function toRoundedString(coordinate, digits, withThousandsSeparator = true) {
    return coordinate
        .map((value) => value.toFixed(digits))
        .map((value) => (withThousandsSeparator ? formatThousand(value) : value))
        .join(', ')
        .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}
