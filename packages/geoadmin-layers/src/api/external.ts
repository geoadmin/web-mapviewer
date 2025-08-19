import log from '@geoadmin/log'
import axios from 'axios'

import externalWMSParser, {
    type WMSCapabilitiesResponse,
} from '@/parsers/ExternalWMSCapabilitiesParser'
import externalWMTSParser, {
    type WMTSCapabilitiesResponse,
} from '@/parsers/ExternalWMTSCapabilitiesParser'
import { CapabilitiesError } from '@/validation'

/** Timeout for accessing external server in [ms] */
export const EXTERNAL_SERVER_TIMEOUT = 30000

/** Sets the WMS GetCapabilities url parameters */
export function setWmsGetCapabilitiesParams(url: URL, language?: string): URL {
    // Manda: URLtory params
    url.searchParams.set('SERVICE', 'WMS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    // Currently openlayers only supports version 1.3.0 !
    url.searchParams.set('VERSION', '1.3.0')
    // Optional params
    url.searchParams.set('FORMAT', 'text/xml')
    if (language) {
        url.searchParams.set('lang', language)
    }
    return url
}

/** Sets the WMS GetMap url parameters */
export function setWmsGetMapParams(url: URL, layer: string, crs: string, style: string): URL {
    // Mandatory params
    url.searchParams.set('SERVICE', 'WMS')
    url.searchParams.set('REQUEST', 'GetMap')
    url.searchParams.set('VERSION', '1.1.0')
    url.searchParams.set('LAYERS', layer)
    url.searchParams.set('STYLES', style)
    url.searchParams.set('SRS', crs)
    url.searchParams.set('BBOX', '10.0,10.0,10.0001,10.0001')
    url.searchParams.set('WIDTH', '1')
    url.searchParams.set('HEIGHT', '1')
    // Optional params
    url.searchParams.set('FORMAT', 'image/png')
    return url
}

/**
 * Read and parse WMS GetCapabilities
 *
 * @param baseUrl Base URL for the WMS server
 * @param language Language parameter to use if the server support localization
 */
export async function readWmsCapabilities(
    baseUrl: string,
    language?: string
): Promise<WMSCapabilitiesResponse | undefined> {
    const url = setWmsGetCapabilitiesParams(new URL(baseUrl), language)
    log.debug(`Read WMTS Get Capabilities: ${url.toString()}`)
    let response = null
    try {
        response = await axios.get(url.toString(), { timeout: EXTERNAL_SERVER_TIMEOUT })
    } catch (error: any) {
        throw new CapabilitiesError(
            `Failed to get WMS Capabilities: ${error?.toString()}`,
            'network_error'
        )
    }

    if (response.status !== 200) {
        const msg = `Failed to read GetCapabilities from ${url}`
        log.error(msg, response)
        throw new CapabilitiesError(msg, 'network_error')
    }

    return parseWmsCapabilities(response.data)
}

/**
 * Parse WMS Get Capabilities string
 *
 * @param content Input content to parse
 */
export function parseWmsCapabilities(content: string): WMSCapabilitiesResponse {
    try {
        return externalWMSParser.parse(content)
    } catch (error: any) {
        throw new CapabilitiesError(
            `Failed to parse WMS capabilities: ${error?.toString()}`,
            'invalid_wms_capabilities'
        )
    }
}

/** Sets the WMTS GetCapabilities url parameters */
export function setWmtsGetCapParams(url: URL, language?: string): URL {
    // Set mandatory parameters
    url.searchParams.set('SERVICE', 'WMTS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    // Set optional parameter
    if (language) {
        url.searchParams.set('lang', language)
    }
    return url
}

/** Read and parse WMTS GetCapabilities */
export async function readWmtsCapabilities(
    baseUrl: string,
    language?: string
): Promise<WMTSCapabilitiesResponse> {
    const url = setWmtsGetCapParams(new URL(baseUrl), language)
    log.debug(`Read WMTS Get Capabilities: ${url}`)

    let response = null
    try {
        response = await axios.get(url.toString(), { timeout: EXTERNAL_SERVER_TIMEOUT })
    } catch (error: any) {
        throw new CapabilitiesError(
            `Failed to get the remote capabilities: ${error?.message}`,
            'network_error'
        )
    }

    if (response.status !== 200) {
        const msg = `Failed to read GetCapabilities from ${url}`
        log.error(msg, response)
        throw new CapabilitiesError(msg, 'network_error')
    }

    return parseWmtsCapabilities(response.data, url)
}

/**
 * Parse WMTS Get Capabilities string
 *
 * @param content Input content to parse
 * @param originUrl Origin URL of the content, this is used as default GetCapabilities URL if not
 *   found in the Capabilities
 */
export function parseWmtsCapabilities(content: string, originUrl: URL): WMTSCapabilitiesResponse {
    try {
        return externalWMTSParser.parse(content, originUrl)
    } catch (error: any) {
        throw new CapabilitiesError(
            `Failed to parse WMTS capabilities: ${error?.toString()}`,
            'invalid_wmts_capabilities'
        )
    }
}

const ENC_PIPE = '%7C'

/**
 * Encode an external layer parameter.
 *
 * This percent encode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding | we avoid to encode other special character
 * twice. But we need to encode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export function encodeExternalLayerParam(param: string): string {
    return param.replace('|', ENC_PIPE)
}

/**
 * Decode an external layer parameter.
 *
 * This percent decode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use decodeURIComponent here because the Vue Router will anyway do the
 * decodeURIComponent() therefore by only decoding | we avoid to decode other special character
 * twice. But we need to decode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export function decodeExternalLayerParam(param: string): string {
    return param.replace(ENC_PIPE, '|')
}
