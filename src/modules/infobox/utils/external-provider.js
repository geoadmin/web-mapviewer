/**
 * WARNING: This code is intended to be run both on the browser application and as standalone Node
 * JS script application !
 *
 * These are helpers function for the import tool that are also used by the
 * check-external-layers-providers.js script.
 */

function appendParamsToUrl(url, paramString) {
    if (paramString) {
        const parts = (url + ' ').split(/[?&]/)
        url +=
            parts.pop() === ' '
                ? paramString
                : parts.length > 0
                ? '&' + paramString
                : '?' + paramString
    }
    return url
}

/**
 * Prepares URL for external layer upload
 *
 * @param url
 * @param lang
 * @returns {Promise<string>}
 */
export function transformUrl(url, lang) {
    // If the url has no file extension or a map parameter,
    // try to load a WMS/WMTS GetCapabilities.
    if (
        (!/\.(kml|kmz|xml|txt)/i.test(url) && !/\w+\/\w+\.[a-zA-Z]+$/i.test(url)) ||
        /map=/i.test(url)
    ) {
        // Append WMS GetCapabilities default parameters
        url = appendParamsToUrl(
            url,
            /wmts/i.test(url)
                ? 'SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0'
                : 'SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0'
        )

        // Use lang param only for admin.ch servers
        if (/admin\.ch/.test(url)) {
            url = appendParamsToUrl(url, `lang=${lang}`)
        }
        // Replace the subdomain template if exists
        url = url.replace(/{s}/, '')
    }
    // Save the good url for the import component.
    return url
}

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
