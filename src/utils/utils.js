import { LineString, Point, Polygon } from 'ol/geom'

import { toLv95 } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'
import { format } from '@/utils/numberUtils'

/**
 * Check if the provided string is a valid URL
 *
 * @param {string} urlToCheck
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUrl(urlToCheck) {
    let url

    try {
        url = new URL(urlToCheck)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}

/**
 * Segmentation of text based on a search string
 *
 * @param {String} text Text to segmentize
 * @param {RegExp | String} search String to search in text for segmentation
 * @returns {[{ text: String; match: Boolean }]} Segmentize text
 */
export function segmentizeMatch(text, search) {
    if (!search) {
        return [{ text: text, match: false }]
    }

    let regex = null
    if (search instanceof RegExp) {
        regex = new RegExp(`(${search.source})`, search.flags)
    } else {
        regex = new RegExp(`(${search})`, 'gi')
    }

    return text.split(regex).map((segment) => {
        if (
            (search instanceof RegExp && regex.test(segment)) ||
            (!(search instanceof RegExp) && segment.toLowerCase() === search.toLowerCase())
        ) {
            // Matching part
            return { text: segment, match: true }
        } else {
            // Non-matching part
            return { text: segment, match: false }
        }
    })
}

/**
 * Parse an RGB color
 *
 * @param {string} color Color code in string format (should be between 0 and 255)
 * @returns {Number} Color code, default to 255 in case of invalid
 */
export function parseRGBColor(color) {
    try {
        return Math.max(Math.min(Number(color), 255), 0)
    } catch (error) {
        log.error(`Invalid RGB color code`, color, error)
        return 255
    }
}

/**
 * Generate file name for exports
 *
 * @param {String} fileExtension
 * @returns {String}
 */
export function generateFilename(fileExtension) {
    fileExtension = fileExtension.replace(/^\./, '')
    const date = new Date()
        .toISOString()
        .split('.')[0]
        .replaceAll('-', '')
        .replaceAll(':', '')
        .replace('T', '')
    return `map.geo.admin.ch_${fileExtension.toUpperCase()}_${date}.${fileExtension.toLowerCase()}`
}

/**
 * Formats minutes to hours and minutes (if more than one hour) e.g. 1230 -> '20h 30min', 55 ->
 * '55min'
 *
 * @param {Number} minutes
 * @returns {string} Time in 'Hh Mmin'
 */
export function formatMinutesTime(minutes) {
    if (isNaN(minutes) || minutes === null) {
        return '-'
    }
    let result = ''
    if (minutes >= 60) {
        let hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        result += `${hours}h`
        if (minutes > 0) {
            result += ` ${minutes}min`
        }
    } else {
        result += `${minutes}min`
    }
    return result
}

/**
 * Format Coordinates
 *
 * @param {[number, number]} coo Coordinates
 * @returns {String} Returns coordinate in a readable format without decimals
 */
export function formatPointCoordinates(coo) {
    return `${format(coo[0], 0)}, ${format(coo[1], 0)}`
}

/**
 * Format distance or ara in a readable format
 *
 * @param {Number} value
 * @param {{ dim: Number; digits: Number; applyFormat: Boolean }} options
 * @returns {String} Distance/area formatted (e.g. 1000 => '1 km')
 */
export function formatMeters(value, { dim = 1, digits = 2, applyFormat = true } = {}) {
    const factor = Math.pow(1000, dim)
    let unit = dim === 1 ? 'm' : 'm²'
    if (value >= factor) {
        unit = dim === 1 ? 'km' : 'km²'
        value /= factor
    }
    value = applyFormat ? format(value, digits) : value.toFixed(digits)
    return `${value} ${unit}`
}

/**
 * Format a geometry info in human readable format
 *
 * WARNING the Coordinate is reprojected to LV95
 *
 * @param {any} type
 * @param {any} coordinates
 * @param {any} epsg
 * @returns {String}
 */
export function geometryInfo(type, coordinates, epsg) {
    const coos95 = toLv95(coordinates, epsg)
    const output = {
        type,
    }
    if (type === Point) {
        output.location = formatPointCoordinates(coos95)
    } else {
        if (type === Polygon) {
            const poly = new Polygon(coos95)
            output.area = formatMeters(poly.getArea(), { dim: 2 })
            const line = new LineString(coos95[0])
            output.perimeter = formatMeters(line.getLength())
        } else {
            const line = new LineString(coos95)
            output.length = formatMeters(line.getLength())
        }
    }
    return output
}

export function formatAngle(value, digits = 2) {
    return `${value.toFixed(digits)}°`
}

/**
 * Returns the URL raw query parameters.
 *
 * @returns {URLSearchParams} Parsed URL query parameters
 * @WARNING This method should be used with care and should only be
 * used to get URL query parameter that are identical in legacy URL paramenters !
 */
export function getUrlQuery() {
    return new URLSearchParams(
        // The legacy link uses the query, while new permalink are behind the hash
        window.location.search || window.location.hash.replace('#/map?', '')
    )
}
