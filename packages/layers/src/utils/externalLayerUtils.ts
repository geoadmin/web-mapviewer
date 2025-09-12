import { setWmsGetCapabilitiesParams, setWmtsGetCapParams } from '@/api/external'

/** Checks if file has WMS Capabilities XML content */
export function isWmsGetCap(fileContent: string): boolean {
    return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(fileContent)
}

/** Checks if file has WMTS Capabilities XML content */
export function isWmtsGetCap(fileContent: string): boolean {
    return /<Capabilities/.test(fileContent)
}

/** Checks if the URL is a WMS url */
export function isWmsUrl(url: string): boolean {
    return /(wms|map=|\.map)/i.test(url)
}

/** Checks if the URL is a WMTS url */
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
    if (isWmtsUrl(provider)) {
        return setWmtsGetCapParams(new URL(provider), language)
    }
    if (isWmsUrl(provider)) {
        return setWmsGetCapabilitiesParams(new URL(provider), language)
    }
    // By default if the URL service type cannot be guessed we use WMS
    return setWmsGetCapabilitiesParams(new URL(provider), language)
}
