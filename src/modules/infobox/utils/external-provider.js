import { setWmsGetCapParams, setWmtsGetCapParams } from '@/api/layers/layers-external.api'

/**
 * Check is provided string valid URL
 *
 * @param {string} urlToCheck
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
 * Checks if file has WMS Capabilities XML content
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isWmsGetCap(fileContent) {
    return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(fileContent)
}

/**
 * Checks if file has WMTS Capabilities XML content
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isWmtsGetCap(fileContent) {
    return /<Capabilities/.test(fileContent)
}

/**
 * Checks if file is KML
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    return /<kml/.test(fileContent) && /<\/kml\s*>/.test(fileContent)
}

/**
 * Checks if file is GPX
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isGpx(fileContent) {
    return /<gpx/.test(fileContent) && /<\/gpx\s*>/.test(fileContent)
}

/**
 * Checks if the URL is a WMS url
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isWmsUrl(url) {
    return /(wms|map=|\.map)/i.test(url)
}

/**
 * Checks if the URL is a WMTS url
 *
 * @param {string} urlreturn SetWmsUrlParameters(new URL(provider), language)
 * @returns {boolean}
 */
export function isWmtsUrl(url) {
    return /wmts/i.test(url)
}

/**
 * Checks if the URL is a KML url
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isKmlUrl(url) {
    return /kml/i.test(url)
}

/**
 * Checks if the URL is a GPX url
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isGpxUrl(url) {
    return /gpx/i.test(url)
}

/**
 * Guess the provider URL type and return URL with correct parameters if needed
 *
 * @param {string} provider Base url of the provider
 * @param {string} language Current viewer language
 * @returns {URL} Url object with backend parameters (eg. SERVICE=WMS, ...)
 */
export function guessExternalLayerUrl(provider, language) {
    if (isKmlUrl(provider) || isGpxUrl(provider)) {
        return new URL(provider)
    }
    if (isWmtsUrl(provider)) {
        return setWmtsGetCapParams(new URL(provider), language)
    }
    if (isWmsUrl(provider)) {
        return setWmsGetCapParams(new URL(provider), language)
    }
    // By default if the URL service type cannot be guessed we use WMS
    return setWmsGetCapParams(new URL(provider), language)
}
