import axios from 'axios'

import WMSCapabilitiesParser from '@/api/layers/WMSCapabilitiesParser.class'
import WMTSCapabilitiesParser from '@/api/layers/WMTSCapabilitiesParser.class'
import log from '@/utils/logging'

/** Timeout for accessing external server in [ms] */
export const EXTERNAL_SERVER_TIMEOUT = 30000

/**
 * WMS or WMTS Capabilities Error
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {string} message Technical english message
 * @property {string} key I18n translation key for user message
 */
export class CapabilitiesError extends Error {
    constructor(message, key) {
        super(message)
        this.key = key
        this.name = 'CapabilitiesError'
    }
}

/**
 * Sets the WMS GetCapabilities url parameters
 *
 * @param {URL} url Url to set
 * @param {string} language Language to use
 * @returns {URL} Url with wms parameter
 */
export function setWmsGetCapParams(url, language) {
    // Mandatory params
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

/**
 * Read and parse WMS GetCapabilities
 *
 * @param {string} baseUrl Base URL for the WMS server
 * @param {string | null} language Language parameter to use if the server support localization
 * @returns {Promise<WMSCapabilitiesParser | null>} WMS Capabilities
 */
export async function readWmsCapabilities(baseUrl, language = null) {
    const url = setWmsGetCapParams(new URL(baseUrl), language).toString()
    log.debug(`Read WMTS Get Capabilities: ${url}`)
    let response = null
    try {
        response = await axios.get(url, { timeout: EXTERNAL_SERVER_TIMEOUT })
    } catch (error) {
        throw new CapabilitiesError(`Failed to get WMS Capabilities: ${error}`, 'network_error')
    }

    if (response.status !== 200) {
        const msg = `Failed to read GetCapabilities from ${url}`
        log.error(msg, response)
        throw new CapabilitiesError(msg, 'network_error')
    }

    return parseWmsCapabilities(response.data, baseUrl)
}

/**
 * Parse WMS Get Capabilities string
 *
 * @param {string} content Input content to parse
 * @param {string} originUrl Origin URL of the content, this is used as default GetCapabilities URL
 *   if not found in the Capabilities
 * @returns {WMSCapabilitiesParser} Get Capabilities object
 */
export function parseWmsCapabilities(content, originUrl) {
    try {
        return new WMSCapabilitiesParser(content, originUrl)
    } catch (error) {
        throw new CapabilitiesError(
            `Failed to parse WMS capabilities: ${error?.message}`,
            'invalid_wms_capabilities'
        )
    }
}

/**
 * Sets the WMTS GetCapabilities url parameters
 *
 * @param {URL} url Url to set
 * @param {string} language Language to use
 * @returns {URL} Url with wmts parameters
 */
export function setWmtsGetCapParams(url, language) {
    // Set mandatory parameters
    url.searchParams.set('SERVICE', 'WMTS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    // Set optional parameter
    if (language) {
        url.searchParams.set('lang', language)
    }
    return url
}

/**
 * Read and parse WMTS GetCapabilities
 *
 * @param {string} baseUrl Base URL for the WMTS server
 * @param {string} originUrl Origin URL of the content, this is used as default GetCapabilities URL
 *   if not found in the Capabilities
 * @returns {Promise<WMTSCapabilitiesParser | null>} WMTS Capabilities
 */
export async function readWmtsCapabilities(baseUrl, language = null) {
    const url = setWmtsGetCapParams(new URL(baseUrl), language).toString()
    log.debug(`Read WMTS Get Capabilities: ${url}`)

    let response = null
    try {
        response = await axios.get(url, { timeout: EXTERNAL_SERVER_TIMEOUT })
    } catch (error) {
        throw new CapabilitiesError(
            `Failed to get the remote capabilities: ${error}`,
            'network_error'
        )
    }

    if (response.status !== 200) {
        const msg = `Failed to read GetCapabilities from ${url}`
        log.error(msg, response)
        throw new CapabilitiesError(msg, 'network_error')
    }

    return parseWmtsCapabilities(response.data, baseUrl)
}

/**
 * Parse WMTS Get Capabilities string
 *
 * @param {string} content Input content to parse
 * @param {string} originUrl Origin URL of the content, this is used as default GetCapabilities URL
 *   if not found in the Capabilities
 * @returns {WMTSCapabilitiesParser} Get Capabilities object
 */
export function parseWmtsCapabilities(content, originUrl) {
    try {
        return new WMTSCapabilitiesParser(content, originUrl)
    } catch (error) {
        throw new CapabilitiesError(
            `Failed to parse WMTS capabilities: ${error?.message}`,
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
export function encodeExternalLayerParam(param) {
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
export function decodeExternalLayerParam(param) {
    return param.replace(ENC_PIPE, '|')
}
