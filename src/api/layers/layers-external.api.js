import axios from 'axios'
import WmsCapabilities from '@/api/layers/wms-capabilities.class'
import WmtsCapabilities from '@/api/layers/wmts-capabilities.class'
import log from '@/utils/logging'

/** Timeout for accessing external server in [ms] */
const externalServerTimeout = 30000

/**
 * Read and parse WMS GetCapabilities
 *
 * @param {string} baseUrl Base URL for the WMS server
 * @returns {Promise<WmsCapabilities | null>} WMS Capabilities
 */
export async function readWmsCapabilities(baseUrl) {
    const url = new URL(baseUrl)
    url.searchParams.set('SERVICE', 'WMS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    const response = await axios.get(url.toString(), { timeout: externalServerTimeout })

    if (response.status !== 200) {
        log.error(`Failed to read GetCapabilities from ${url.topString()}`, response)
        return null
    }

    return parseWmsCapabilities(response.data, baseUrl)
}

/**
 * Parse WMS Get Capabilities string
 *
 * @param {string} content Input content to parse
 * @param {string} originUrl Origin URL of the content, this is used as default GetCapabilities URL
 *   if not found in the Capabilities
 * @returns {WmsCapabilities} Get Capabilities object
 */
export function parseWmsCapabilities(content, originUrl) {
    try {
        return new WmsCapabilities(content, originUrl)
    } catch (error) {
        log.error(`Failed to parse WMS Get Capabilities`, error)
        return null
    }
}

/**
 * Read and parse WMTS GetCapabilities
 *
 * @param {string} baseUrl Base URL for the WMTS server
 * @returns {Promise<WmtsCapabilities | null>} WMTS Capabilities
 */
export async function readWmtsCapabilities(baseUrl) {
    const url = new URL(baseUrl)
    url.searchParams.set('SERVICE', 'WMTS')
    url.searchParams.set('REQUEST', 'GetCapabilities')
    try {
        const response = await axios.get(url.toString(), { timeout: externalServerTimeout })

        if (response.status !== 200) {
            log.error(`Failed to read GetCapabilities from ${url.toString()}`, response)
            return null
        }

        return parseWmtsCapabilities(response.data, baseUrl)
    } catch (error) {
        log.error(`Failed to get and parse the capabilities: ${error}`)
        return null
    }
}

/**
 * Parse WMTS Get Capabilities string
 *
 * @param {string} content Input content to parse
 * @param {string} originUrl Origin URL of the content, this is used as default GetCapabilities URL
 *   if not found in the Capabilities
 * @returns {WmtsCapabilities} Get Capabilities object
 */
export function parseWmtsCapabilities(content, originUrl) {
    try {
        return new WmtsCapabilities(content, originUrl)
    } catch (error) {
        log.error(`Failed to parse WMTS Get Capabilities`, error)
        return null
    }
}
