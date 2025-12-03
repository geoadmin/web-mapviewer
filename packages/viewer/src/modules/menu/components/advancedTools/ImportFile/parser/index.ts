import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { FileLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'

import type { ParseOptions } from '@/modules/menu/components/advancedTools/ImportFile/parser/types'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl } from '@/api/files.api'
import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
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

    // Prioritize specific errors over generic InvalidFileContentError
    // This ensures that if a parser successfully identifies the file format
    // but encounters a specific issue (e.g., out of bounds), that error is shown
    const rejectedResponses = allSettled.filter(
        (response) => response.status === 'rejected' && response.reason
    ) as PromiseRejectedResult[]

    // Priority order: OutOfBounds > Empty > UnknownProjection > Invalid > Other
    const outOfBoundsError = rejectedResponses.find(
        (response) => response.reason instanceof OutOfBoundsError
    )
    if (outOfBoundsError) {
        throw outOfBoundsError.reason
    }

    const emptyFileError = rejectedResponses.find(
        (response) => response.reason instanceof EmptyFileContentError
    )
    if (emptyFileError) {
        throw emptyFileError.reason
    }

    const unknownProjectionError = rejectedResponses.find(
        (response) => response.reason instanceof UnknownProjectionError
    )
    if (unknownProjectionError) {
        throw unknownProjectionError.reason
    }

    // Fall back to any error (including InvalidFileContentError)
    const firstError = rejectedResponses[0]
    if (firstError) {
        throw firstError.reason
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
    const fileComplianceCheck = await checkOnlineFileCompliance(fileSource)
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