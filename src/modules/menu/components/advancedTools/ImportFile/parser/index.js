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
 * @returns {Promise<{ mimeType: [String, null]; loadedContent: [null, String, ArrayBuffer] }>}
 */
export async function getOnlineFileContent(fileUrl) {
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
    if (!mimeType) {
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
            loadedContent = await getFileFromUrl(fileUrl)
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
        const { mimeType, loadedContent } = await getOnlineFileContent(fileSource)
        return await parseAll(
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
    }
    return await parseAll({
        fileSource,
        currentProjection,
    })
}
