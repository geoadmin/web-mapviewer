/**
 * Checks if file has WMS Capabilities XML content
 */
export function isWmsGetCap(fileContent: string): boolean {
    return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(fileContent)
}

/**
 * Checks if file has WMTS Capabilities XML content
 */
export function isWmtsGetCap(fileContent: string): boolean {
    return /<Capabilities/.test(fileContent)
}

/**
 * Checks if the URL is a WMS url
 */
export function isWmsUrl(url: string): boolean {
    return /(wms|map=|\.map)/i.test(url)
}

/**
 * Checks if the URL is a WMTS url
 */
export function isWmtsUrl(url: string): boolean {
    return /wmts/i.test(url)
}

/**
 * Guess the provider URL type and return URL with correct parameters if needed
 *
 * @param provider Base url of the provider
 * @param language Current viewer language
 * @returns Url object with backend parameters (eg. SERVICE=WMS, ...)
 */
export function guessExternalLayerUrl(provider: string, language: string): URL {
    // Note: setWmsGetCapParams and setWmtsGetCapParams would need to be migrated too
    // For now, just return a basic URL construction
    const url = new URL(provider)

    if (isWmtsUrl(provider)) {
        // Add WMTS parameters
        url.searchParams.set('SERVICE', 'WMTS')
        url.searchParams.set('REQUEST', 'GetCapabilities')
        url.searchParams.set('lang', language)
        return url
    }

    if (isWmsUrl(provider)) {
        // Add WMS parameters
        url.searchParams.set('SERVICE', 'WMS')
        url.searchParams.set('REQUEST', 'GetCapabilities')
        url.searchParams.set('lang', language)
        return url
    }

    // By default if the URL service type cannot be guessed we use WMS
    url.searchParams.set('SERVICE', 'WMS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    url.searchParams.set('lang', language)
    return url
}
