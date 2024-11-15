import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl } from '@/api/files.api'
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import log from '@/utils/logging'

const allParsers = [
    new CloudOptimizedGeoTIFFParser(),
    new KMZParser(),
    new KMLParser(),
    new GPXParser(),
]

/**
 * @param {Object} config
 * @param {File | String} config.fileSource
 * @param {CoordinateSystem} config.currentProjection
 * @param {Object} [options]
 * @param {OnlineFileCompliance} [options.fileCompliance]
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
 * @returns {Promise<AbstractLayer>}
 */
export async function parseLayerFromFile(fileSource, currentProjection) {
    // if local file, just parse it
    if (fileSource instanceof File) {
        return await parseAll({
            fileSource,
            currentProjection,
        })
    }

    // online file, we start by getting its MIME type and other compliance information (CORS, HTTPS)
    const fileComplianceCheck = await checkOnlineFileCompliance(fileSource)
    log.debug(
        '[FileParser][parseLayerFromFile] file',
        fileSource,
        'has compliance',
        fileComplianceCheck
    )
    const { mimeType, supportsCORS, supportsHTTPS } = fileComplianceCheck

    if (mimeType) {
        // trying to find a matching parser only based on MIME type. This is required for COG, as we
        // can't be loading the entire COG data to check against our parsers (some COG can weight in the To)
        const parserMatchingMIME = allParsers.find((parser) =>
            parser.fileContentTypes.includes(mimeType)
        )
        if (parserMatchingMIME) {
            log.debug(
                '[FileParser][parseLayerFromFile] parser found for MIME type',
                mimeType,
                parserMatchingMIME
            )
            return parserMatchingMIME.parseUrl(fileSource, currentProjection, {
                fileCompliance: fileComplianceCheck,
            })
        }
    }

    // no MIME type match, getting file content and trying to find a parser that can handle it
    try {
        log.debug(
            '[FileParser][parseLayerFromFile] no MIME type match, loading file content for',
            fileSource
        )
        let loadedContent = null
        if (supportsCORS && supportsHTTPS) {
            loadedContent = await getFileContentFromUrl(fileSource)
        } else {
            loadedContent = await getFileContentThroughServiceProxy(fileSource)
        }
        return await parseAll(
            {
                fileSource,
                currentProjection,
            },
            {
                fileCompliance: fileComplianceCheck,
                loadedContent,
            }
        )
    } catch (error) {
        log.error(
            '[FileParser][parseLayerFromFile] could not get content for file',
            fileSource,
            error
        )
        throw error
    }
}
