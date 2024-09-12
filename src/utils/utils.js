import { LineString, Point, Polygon } from 'ol/geom'

import { internalDomainRegex } from '@/config/baseUrl.config'
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
 * Escape all RegExp special character from string
 *
 * @param {String} string
 * @returns {String} New string with all special RegExp character escaped
 */
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
        regex = new RegExp(`(${escapeRegExp(search)})`, 'gi')
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
 * Parse a URL hash fragment
 *
 * We use query in the hash fragment, the standard new URL doesn't parse the query from the hash,
 * this function does and return the URL object with the hash fragment without query and the the
 * query separated.
 *
 * @param {string} url
 * @returns {{ urlObj: URL; hash: string; query: string }} Parsed url
 */
export function parseUrlHashQuery(url) {
    const urlObj = new URL(url)
    // extract query from hash
    let queryIndex = urlObj.hash.indexOf('?')
    queryIndex = queryIndex >= 0 ? queryIndex : urlObj.hash.length
    const hash = urlObj.hash.substring(0, queryIndex)
    const query = urlObj.hash.substring(queryIndex)
    return {
        urlObj,
        hash,
        query,
    }
}

/**
 * Transform a /#/map url to /#/embed url
 *
 * If the URL is not a SCHEME://DOMAIN/#/map then it is returned unchanged.
 *
 * @param {string} url Url to transform on /#/embed
 * @returns {string} Url transformed to /#/embed
 */
export function transformUrlMapToEmbed(url) {
    const { urlObj, hash, query } = parseUrlHashQuery(url)
    log.debug(`Transform url from map to embed hash=${hash}`, urlObj)
    if (hash === '#/map') {
        urlObj.hash = `#/embed${query}`
    }
    return urlObj.toString()
}

/**
 * Check if the provided string is a valid email address
 *
 * @param {string} email Email address to check
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidEmail(email) {
    // comes from https://v2.vuejs.org/v2/cookbook/form-validation.html#Using-Custom-Validation
    const EMAIL_REGEX =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return EMAIL_REGEX.test(email)
}

/**
 * Human readable size
 *
 * @param {Number} size Size in bytes
 * @returns {String} Human readable size
 */
export function humanFileSize(size) {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

/**
 * Check if the given url is an internal URL (from bgdi.ch or admin.ch subdomain)
 *
 * @param {string} url
 * @returns {boolean} Returns true if the url is part of an internal server
 */
export function isInternalUrl(url) {
    return internalDomainRegex.test(url)
}

/**
 * Check if the input is a zipfile content or not
 *
 * @param {ArrayBuffer} content
 * @returns {boolean} Return true if the content is a zipfile content
 */
export function isZipContent(content) {
    // Check the first 4 bytes for the ZIP file signature
    const zipSignature = [0x50, 0x4b, 0x03, 0x04]
    const view = new Uint8Array(content.slice(0, 4))
    for (let i = 0; i < zipSignature.length; i++) {
        if (view[i] !== zipSignature[i]) {
            return false
        }
    }
    return true
}
