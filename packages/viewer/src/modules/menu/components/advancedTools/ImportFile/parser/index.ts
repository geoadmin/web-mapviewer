import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { FileLayer } from '@swissgeo/layers'

import { fileProxyAPI, filesAPI } from '@swissgeo/api'
import log from '@swissgeo/log'

import type { ParseOptions } from '@/modules/menu/components/advancedTools/ImportFile/parser/types'

import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'

const allParsers = [
    new CloudOptimizedGeoTIFFParser(),
    new KMZParser(),
    new KMLParser(),
    new GPXParser(),
]

interface ParseAllConfig {
    fileSource: File | string
    currentProjection: CoordinateSystem
}

async function parseAll(config: ParseAllConfig, options?: ParseOptions): Promise<FileLayer> {
    const allSettled = await Promise.allSettled(
        allParsers.map((parser) => parser.parse(config, options))
    )
    const firstFulfilled = allSettled.find(
        (response) => response.status === 'fulfilled' && response.value !== undefined
    )
    if (firstFulfilled) {
        return (firstFulfilled as PromiseFulfilledResult<FileLayer>).value
    }
    const anyErrorRaised = allSettled.find(
        (response) => response.status === 'rejected' && response.reason
    )
    if (anyErrorRaised) {
        throw (anyErrorRaised as PromiseRejectedResult).reason
    }
    throw new Error('Could not parse file')
}

/**
 * @param fileSource
 * @param currentProjection Can be used to check bounds of parsed file against the current
 *   projection (and raise OutOfBoundError in case no mutual data is available)
 */
export async function parseLayerFromFile(
    fileSource: File | string,
    currentProjection: CoordinateSystem
): Promise<FileLayer> {
    // if local file, just parse it
    if (fileSource instanceof File) {
        return await parseAll({
            fileSource,
            currentProjection,
        })
    }

    // online file, we start by getting its MIME type and other compliance information (CORS, HTTPS)
    const fileComplianceCheck = await filesAPI.checkOnlineFileCompliance(fileSource)
    log.debug({
        title: '[FileParser][parseLayerFromFile]',
        messages: ['file', fileSource, 'has compliance', fileComplianceCheck],
    })
    const { mimeType, supportsCORS, supportsHTTPS } = fileComplianceCheck

    if (mimeType) {
        // trying to find a matching parser only based on MIME type. This is required for COG, as we
        // can't be loading the entire COG data to check against our parsers (some COG can weight in the To)
        const parserMatchingMIME = allParsers.find((parser) =>
            parser.fileContentTypes.includes(mimeType)
        )
        if (parserMatchingMIME) {
            log.debug({
                title: '[FileParser][parseLayerFromFile]',
                messages: ['parser found for MIME type', mimeType, parserMatchingMIME],
            })
            return parserMatchingMIME.parseUrl(fileSource, currentProjection, {
                fileCompliance: fileComplianceCheck,
            })
        }
    }

    // no MIME type match, getting file content and trying to find a parser that can handle it
    try {
        log.debug({
            title: '[FileParser][parseLayerFromFile]',
            messages: ['no MIME type match, loading file content for', fileSource],
        })
        let loadedContent: ArrayBuffer | undefined
        if (supportsCORS && supportsHTTPS) {
            loadedContent = await filesAPI.getFileContentFromUrl(fileSource)
        } else {
            loadedContent = await fileProxyAPI.getFileContentThroughServiceProxy(fileSource)
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
        log.error({
            title: '[FileParser][parseLayerFromFile]',
            messages: [
                `could not get content for file ${fileSource}`,
                error instanceof Error ? error.message : String(error),
            ],
        })
        throw error
    }
}
