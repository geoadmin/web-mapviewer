import axios from 'axios'

import { getContentThroughServiceProxy } from '@/api/file-proxy.api.js'
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import log from '@/utils/logging.js'

const allParsers = [new KMZParser(), new KMLParser(), new GPXParser()]

/**
 * @param {Object} config
 * @param {File | String} config.fileSource
 * @param {CoordinateSystem} config.currentProjection
 * @param {Object} [options]
 * @param {Boolean} [options.allowServiceProxy=false] Default is `false`
 * @param {String} [options.mimeType]
 * @param {ArrayBuffer} [options.loadedContent]
 * @returns {Promise<AbstractLayer>}
 */
async function parseAll(config, options) {
    const allSettled = await Promise.allSettled(
        allParsers.map((parser) => parser.parse(config, options))
    )
    const firstFulfilled = allSettled.find(
        (response) => response.status === 'fulfilled' && response.value instanceof AbstractLayer
    )
    if (firstFulfilled) {
        return firstFulfilled.value
    }
    const anyErrorRaised = allSettled.find(
        (response) => response.status === 'rejected' && response.reason
    )
    if (anyErrorRaised) {
        throw anyErrorRaised.reason
    }
    throw new Error('Could not parse file')
}

/**
 * @param {File | String} fileSource
 * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file against
 *   the current projection (and raise OutOfBoundError in case no mutual data is available)
 * @param {Object} [options]
 * @param {Number} [options.timeout] The timeout length (in milliseconds) to use when requesting
 *   online file
 * @returns {Promise<AbstractLayer>}
 */
export async function parseLayerFromFile(fileSource, currentProjection, options = {}) {
    const isLocalFile = fileSource instanceof File
    let mimeType = null
    if (!isLocalFile) {
        // running a HEAD request on the resource to only gather this info once for all file parsers
        try {
            const headResponse = await axios.head(fileSource)
            mimeType = headResponse.headers.get('content-type')
            log.debug('[FileParsing] got MIME type', mimeType, 'for file', fileSource)
        } catch (err) {
            log.debug(
                '[File parsing] could not have a HEAD response on',
                fileSource,
                'this file might require service-proxy'
            )
        }
    }
    // if we could read the MIME type of the file, we parse the file disabling any service-proxy request
    if (mimeType) {
        try {
            return await parseAll(
                {
                    fileSource,
                    currentProjection,
                },
                {
                    ...options,
                    mimeType,
                    allowServiceProxy: false,
                }
            )
        } catch (error) {
            log.error('[FileParser] Could not parse file through mime type detection', error)
            throw error
        }
    }
    // if MIME type detection was unsuccessful, we attempt another pass of parsing, this time using service-proxy to ge the file's content
    if (!isLocalFile) {
        log.debug('[FileParser] MIME type detection failed, going through service-proxy')
        return await parseAll(
            {
                fileSource,
                currentProjection,
            },
            {
                ...options,
                // only firing service-proxy request once here, the same response will be used by all parsers
                loadedContent: await getContentThroughServiceProxy(fileSource),
                allowServiceProxy: false,
            }
        )
    }
    return await parseAll({
        fileSource,
        currentProjection,
    })
}
