import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import log from '@swissgeo/log'

import type {
    ParseConfig,
    ParseOptions,
    ValidateFileContent,
} from '@/modules/menu/components/advancedTools/ImportFile/parser/types'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl } from '@/api/files.api'

interface FileParserConfig {
    displayedName?: string
    fileTypeLittleEndianSignature?: number[][]
    fileExtensions?: string[]
    fileContentTypes?: string[]
    shouldLoadOnlineContent?: boolean
    validateFileContent?: ValidateFileContent
    allowServiceProxy?: boolean
}

/**
 * Base class to build a file parser upon. Each file parser detects if it can handle the file
 * through a list of file extensions or little endian signature.
 *
 * @abstract
 */
export default abstract class FileParser {
    fileTypeLittleEndianSignature: number[][]
    fileExtensions: string[]
    fileContentTypes: string[]
    shouldLoadOnlineContent: boolean
    validateFileContent: ValidateFileContent | undefined
    allowServiceProxy: boolean

    /**
     * @param config.displayedName Name used to describe this file type to the end user
     * @param config.fileTypeLittleEndianSignature Little endian signature (aka magic
     *   numbers), if any, for this file type. Will be used to check the first 4 bytes of the file.
     * @param config.fileExtensions Which file extensions this file type is carried with
     *   (case-insensitive)
     * @param config.fileContentTypes Which MIME types are typically associated with this
     *   file type. Will be used with one HTTP HEAD request on the file URL (if online file) to
     *   assert if this parser is the valid candidate for the file.
     * @param config.shouldLoadOnlineContent Flag telling if remote content should
     *   be loaded by this parser to properly parse it. If set to false, no GET (or proxy) request
     *   will be fired on the file URL. Default is `true`
     * @param config.validateFileContent Function receiving the content
     *   from a file (as ArrayBuffer), and assessing if it is a match for this parser. Default is
     *   `undefined`
     * @param config.allowServiceProxy Flag telling if the content of the file can
     *   be requested through service-proxy in case the server hosting the file doesn't support
     *   CORS. Default is `false`
     */
    constructor(config: FileParserConfig = {}) {
        const {
            fileTypeLittleEndianSignature = [],
            fileExtensions = [],
            fileContentTypes = [],
            shouldLoadOnlineContent = true,
            validateFileContent = undefined,
            allowServiceProxy = false,
        } = config
        this.fileTypeLittleEndianSignature = fileTypeLittleEndianSignature
        this.fileExtensions = fileExtensions
        this.fileContentTypes = fileContentTypes
        this.shouldLoadOnlineContent = shouldLoadOnlineContent
        this.validateFileContent = validateFileContent
        this.allowServiceProxy = allowServiceProxy
    }

    isLocalFile(fileSource: File | string): fileSource is File {
        return fileSource instanceof File
    }

    /**
     * Will detect, through the file's content (its little endian signature) or the file name (file
     * extension) if this parser could be a valid match for this file.
     */
    async isLocalFileParsingPossible(fileSource: File): Promise<boolean> {
        const fileArrayBuffer = await fileSource.arrayBuffer()
        // if a little endian signature was found, and we know one to match against, we prioritize this way of
        // detecting if this file is a valid candidate
        if (
            fileArrayBuffer.byteLength >= 4 &&
            this.fileTypeLittleEndianSignature.length > 0 &&
            this.fileTypeLittleEndianSignature.every((signature) => signature.length === 4)
        ) {
            const littleEndianSignature = new Uint8Array(fileArrayBuffer.slice(0, 4))
            return !!this.fileTypeLittleEndianSignature.find((signature) =>
                signature.every((byte, index) => byte === littleEndianSignature[index])
            )
        }
        // if no known little endian signature for this file type we fall back to check the file extension
        return (
            this.fileExtensions.length > 0 &&
            this.fileExtensions.some(
                (extension) => fileSource.name.toLowerCase().indexOf(extension.toLowerCase()) !== -1
            )
        )
    }

    async parseLocalFile(file: File, currentProjection: CoordinateSystem): Promise<Layer> {
        return this.parseFileContent(await file.arrayBuffer(), file, currentProjection)
    }

    isFileContentValid(fileArrayBuffer: ArrayBuffer): boolean {
        if (!this.validateFileContent) {
            return false
        }
        return this.validateFileContent(fileArrayBuffer)
    }

    /**
     * Will detect through a HEAD request if Content-type (or file extension) are a match and this
     * parser could try parsing this URL.
     */
    async isOnlineFileParsingPossible(
        fileUrl: string,
        options: ParseOptions = {}
    ): Promise<boolean> {
        const { fileCompliance = undefined, loadedContent = undefined } = options

        if (fileCompliance?.mimeType && this.fileContentTypes.includes(fileCompliance.mimeType)) {
            return true
        }

        if (loadedContent) {
            return this.isFileContentValid(loadedContent)
        }

        log.debug(
            `[FileParser][${this.constructor.name}] no pre-loaded content to verify, launching HEAD request on file URL`,
            fileUrl,
            this.constructor.name
        )
        // HEAD/GET request wasn't run yet (we are not coming from the main parseLayerFromFile function)
        // so we have to run all the requests ourselves
        try {
            const { mimeType, supportsCORS, supportsHTTPS } =
                await checkOnlineFileCompliance(fileUrl)
            // if a MIME type match is found, then all good
            if (mimeType && this.fileContentTypes.includes(mimeType)) {
                return true
            }
            // if no MIME type match and file content can be checked, we load it now
            if (this.shouldLoadOnlineContent) {
                try {
                    let loadedContent: ArrayBuffer | undefined
                    if (supportsCORS && supportsHTTPS) {
                        loadedContent = await getFileContentFromUrl(fileUrl)
                    } else {
                        loadedContent = await getFileContentThroughServiceProxy(fileUrl)
                    }
                    return loadedContent ? this.isFileContentValid(loadedContent) : false
                } catch (error) {
                    log.error({
                        title: `[FileParser][${this.constructor.name}]`,
                        message: [
                            `Could not load file content for ${fileUrl}`,
                            error instanceof Error ? error.message : String(error),
                        ],
                    })
                }
            }
        } catch (error) {
            log.warn({
                title: `[FileParser][${this.constructor.name}]`,
                message: [
                    `HEAD request failed, could not parse ${fileUrl}`,
                    this.constructor.name,
                    error instanceof Error ? error.message : String(error),
                ],
            })
        }
        return false
    }

    /**
     * @abstract
     */
    abstract parseFileContent(
        fileContent: ArrayBuffer | undefined,
        fileSource: File | string,
        currentProjection: CoordinateSystem
    ): Promise<Layer>

    async parseUrl(
        fileUrl: string,
        currentProjection: CoordinateSystem,
        options: ParseOptions = {}
    ): Promise<Layer> {
        const { loadedContent, fileCompliance } = options
        if (loadedContent) {
            log.debug(
                `[FileParser][${this.constructor.name}] preloaded content detected, won't create new requests`
            )
            return await this.parseFileContent(loadedContent, fileUrl, currentProjection)
        } else if (this.shouldLoadOnlineContent) {
            // no preloaded content, we load the file ourselves
            // checking for CORS/HTTPS support
            const { supportsCORS, supportsHTTPS } =
                fileCompliance ?? (await checkOnlineFileCompliance(fileUrl))
            let fileContent: ArrayBuffer | undefined
            if (supportsCORS && supportsHTTPS) {
                fileContent = await getFileContentFromUrl(fileUrl)
            } else if (this.allowServiceProxy) {
                fileContent = await getFileContentThroughServiceProxy(fileUrl)
            } else {
                throw new Error(
                    `[FileParser][${this.constructor.name}] could not load content for file ${fileUrl}`
                )
            }

            return await this.parseFileContent(fileContent, fileUrl, currentProjection)
        }
        return await this.parseFileContent(undefined, fileUrl, currentProjection)
    }

    /**
     * @throws OutOfBoundsError if the imported file is out of bound of the current projection
     * @throws EmptyFileContentError if missing data (or no data) while reading the file
     */
    async parse(config: ParseConfig, options: ParseOptions = {}): Promise<Layer> {
        const { fileSource, currentProjection } = config
        if (!fileSource || !currentProjection) {
            log.error(
                `[FileParser][${this.constructor.name}] Could not attempt parsing of the file, wrong configuration received`,
                config
            )
            throw new Error('Invalid parsing configuration')
        }
        if (this.isLocalFile(fileSource)) {
            if (await this.isLocalFileParsingPossible(fileSource)) {
                return this.parseLocalFile(fileSource, currentProjection)
            }
        } else if (await this.isOnlineFileParsingPossible(fileSource, options)) {
            return this.parseUrl(fileSource, currentProjection, options)
        }
        // rejecting parsing
        throw new Error('Parsing rejected')
    }
}
