import { getContentThroughServiceProxy } from '@/api/file-proxy.api'
import { getFileFromUrl, getFileMimeType } from '@/api/files.api'
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import log from '@/utils/logging'

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
 * Will (attempt to) load the MIME type of the file (through a HEAD request) and then decide if it
 * requires service-proxy to get the content (HEAD request failed) or if the content should be
 * loaded with a simple GET request.
 *
 * If nothing could get loaded (HTTP 4xx or 5xx for both request) it will return `null` for both
 * mimeType and loadedContent (no error will be thrown)
 *
 * @param {String} fileUrl
 * @param {Object} [options]
 * @param {Boolean} [options.allowServiceProxy=false] Flag telling the function if it can use
 *   service-proxy in case a HEAD feature failed (potential CORS issue) on the file URL. Only use it
 *   for file format that are meant for non-technical users (KML/GPX,etc...). Default is `false`
 * @returns {Promise<{ mimeType: [String, null]; loadedContent: [null, ArrayBuffer] }>}
 */
export async function getOnlineFileContent(fileUrl, options) {
    const { allowServiceProxy = false } = options
    let mimeType = null
    let loadedContent = null
    try {
        mimeType = await getFileMimeType(fileUrl)
        log.debug('[FileParser] got MIME type', mimeType, 'for file', fileUrl)
    } catch (error) {
        log.debug(
            '[FileParser][getOnlineFileContent] could not have a HEAD response on',
            fileUrl,
            'this file might require service-proxy',
            error
        )
    }
    if (!mimeType && allowServiceProxy) {
        try {
            loadedContent = await getContentThroughServiceProxy(fileUrl)
        } catch (error) {
            log.error(
                '[FileParser][getOnlineFileContent] could not get content of file',
                fileUrl,
                'through service-proxy',
                error
            )
        }
    }
    if (!loadedContent) {
        try {
            const fileContentRequest = await getFileFromUrl(fileUrl, {
                responseType: 'arraybuffer',
            })
            loadedContent = fileContentRequest.data
        } catch (error) {
            log.error(
                '[FileParser][getOnlineFileContent] could not get content for file',
                fileUrl,
                error
            )
        }
    }
    return {
        loadedContent,
        mimeType,
    }
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
    if (!isLocalFile) {
        // first pass without using service-proxy
        const { mimeType, loadedContent } = await getOnlineFileContent(fileSource, {
            allowServiceProxy: false,
        })
        const resultsWithoutServiceProxy = await parseAll(
            {
                fileSource,
                currentProjection,
            },
            {
                ...options,
                mimeType,
                loadedContent,
                allowServiceProxy: false,
            }
        )
        if (resultsWithoutServiceProxy) {
            return resultsWithoutServiceProxy
        }
        // getting content through service-proxy and running another pass of parsing
        try {
            const proxyfiedContent = await getContentThroughServiceProxy(fileSource)
            return await parseAll(
                {
                    fileSource,
                    currentProjection,
                },
                {
                    ...options,
                    mimeType,
                    loadedContent: proxyfiedContent,
                    allowServiceProxy: false,
                }
            )
        } catch (error) {
            log.error(
                '[FileParser][parseLayerFromFile] could not get content through service-proxy for file',
                fileSource,
                error
            )
            throw error
        }
    }
    return await parseAll({
        fileSource,
        currentProjection,
    })
}
