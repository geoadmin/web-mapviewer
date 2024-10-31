import axios from 'axios'

import { getContentThroughServiceProxy } from '@/api/file-proxy.api'
import { getFileFromUrl } from '@/api/files.api'
import log from '@/utils/logging'

/**
 * @function
 * @typedef ValidateFileContent
 *
 *   Function receiving the content from a file, and assessing if it is a match for this parser
 * @param {ArrayBuffer} content
 * @returns {Boolean} Content is a match for this parser, or not
 */

/**
 * Base class to build a file parser upon. Each file parser detects if it can handle the file
 * through a list of file extensions or little endian signature.
 *
 * @abstract
 */
export default class FileParser {
    /**
     * @param {String} config.displayedName Name used to describe this file type to the end user
     * @param {Number[]} config.fileTypeLittleEndianSignature Little endian signature (aka magic
     *   numbers), if any, for this file type. Will be used to check the first 4 bytes of the file.
     * @param {String[]} config.fileExtensions Which file extensions this file type is carried with
     *   (case-insensitive)
     * @param {String[]} config.fileContentTypes Which MIME types are typically associated with this
     *   file type. Will be used with one HTTP HEAD request on the file URL (if online file) to
     *   assert if this parser is the valid candidate for the file.
     * @param {ValidateFileContent} [config.validateFileContent=null] Function receiving the content
     *   from a file (as ArrayBuffer), and assessing if it is a match for this parser. Default is
     *   `null`
     * @param {Boolean} [config.readFileAsText=false] Will load file as text if `true`, if `false`
     *   will use ArrayBuffer instead. Only set it to true when you know the file type is supposed
     *   to be read in its entirety (KML/GPX) but never set it to true for format that can get very
     *   large (COG) or aren't fit for text reader (zip files). Default is `false`
     */
    constructor(config = {}) {
        const {
            fileTypeLittleEndianSignature = [],
            fileExtensions = [],
            fileContentTypes = [],
            validateFileContent = null,
            readFileAsText = false,
        } = config
        this.fileTypeLittleEndianSignature = fileTypeLittleEndianSignature
        this.fileExtensions = fileExtensions
        this.fileContentTypes = fileContentTypes
        this.validateFileContent = validateFileContent
        this.readFileAsText = readFileAsText
    }

    /**
     * @param {File | String} fileSource
     * @returns {boolean}
     */
    isLocalFile(fileSource) {
        return fileSource instanceof File
    }

    /**
     * Will detect, through the file's content (its little endian signature) or the file name (file
     * extension) if this parser could be a valid match for this file.
     *
     * @param {File} fileSource
     * @returns {Promise<Boolean>}
     */
    async isLocalFileParsingPossible(fileSource) {
        const fileArrayBuffer = await fileSource.arrayBuffer()
        // if a little endian signature was found, and we know one to match against, we prioritize this way of
        // detecting if this file is a valid candidate
        if (fileArrayBuffer.byteLength >= 4 && this.fileTypeLittleEndianSignature.length === 4) {
            const littleEndianSignature = new Uint8Array(fileArrayBuffer.slice(0, 4))
            return this.fileTypeLittleEndianSignature.every(
                (byte, index) => byte === littleEndianSignature[index]
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

    /**
     * @param {File} file
     * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @returns {Promise<AbstractLayer>}
     */
    async parseLocalFile(file, currentProjection) {
        if (this.readFileAsText) {
            return this.parseFileContent(
                new TextDecoder('utf-8').decode(await file.arrayBuffer()),
                file.name,
                currentProjection
            )
        }
        return this.parseFileContent(await file.arrayBuffer(), file.name, currentProjection)
    }

    /**
     * @param {ArrayBuffer} fileArrayBuffer
     * @returns {Boolean}
     */
    isFileContentValid(fileArrayBuffer) {
        if (!this.validateFileContent) {
            return false
        }
        return this.validateFileContent(fileArrayBuffer)
    }

    /**
     * Will detect through a HEAD request if Content-type (or file extension) are a match and this
     * parser could try parsing this URL.
     *
     * @param {String} fileUrl
     * @param {Object} options
     * @param {Boolean} [options.allowServiceProxy] Flag telling if the resource could be accessed
     *   with the use of service-proxy if another means do not work (MIME type parsing or little
     *   endian signature detection)
     * @param {String} [options.mimeType] MIME type (from a Content-Type HTTP header) gathered from
     *   a previous HEAD request (so no need to re-run a HEAD request to get this info)
     * @param {ArrayBuffer} [options.loadedContent] File content already loaded (most likely by
     *   service-proxy). When given, no other request will be made on the file source, but this
     *   content will be used instead.
     * @returns {Promise<Boolean>}
     */
    async isOnlineFileParsingPossible(fileUrl, options = {}) {
        const { allowServiceProxy = false, mimeType = null, loadedContent = null } = options

        if (mimeType && !loadedContent) {
            return this.fileContentTypes.includes(mimeType)
        }

        if (loadedContent) {
            return this.isFileContentValid(loadedContent)
        }

        log.debug(
            `[FileParser][${this.constructor.name}] no pre-loaded content to verify, launching HEAD request on file URL`,
            fileUrl,
            this.constructor.name
        )
        // HEAD request wasn't run yet (we are not coming from the main parseLayerFromFile function)
        // so we have to run all the requests ourselves
        try {
            const headResponse = await axios.head(fileUrl)
            return this.fileContentTypes.includes(headResponse.headers.get('content-type'))
        } catch (error) {
            if (allowServiceProxy) {
                log.debug(
                    `[FileParser][${this.constructor.name}] could not access resource through HEAD request, trying through service-proxy`,
                    fileUrl
                )
                return this.isFileContentValid(await getContentThroughServiceProxy(fileUrl))
            } else {
                log.debug(
                    `[FileParser][${this.constructor.name}] HEAD request failed, but service-proxy is not allowed for file, could not parse`,
                    fileUrl,
                    this.constructor.name
                )
            }
        }
        return false
    }

    /**
     * @abstract
     * @param {String | ArrayBuffer} fileContent
     * @param {String} fileSource
     * @param {CoordinateSystem} currentProjection
     * @returns {Promise<AbstractLayer>}
     */
    async parseFileContent(fileContent, fileSource, currentProjection) {
        throw new Error(`Not yet implemented ${fileContent} ${fileSource} ${currentProjection}`)
    }

    /**
     * @param {String} fileUrl
     * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @param {Object} options
     * @param {Number} [options.timeout] The timeout length (in milliseconds) to use when requesting
     *   online file
     * @returns {Promise<AbstractLayer>}
     */
    async parseUrl(fileUrl, currentProjection, options) {
        const { loadedContent = null } = options
        if (loadedContent) {
            log.debug(
                `[FileParser][${this.constructor.name}] preloaded content detected, won't create new requests`
            )
            if (this.readFileAsText && loadedContent instanceof ArrayBuffer) {
                log.debug(
                    `[FileParser][${this.constructor.name}] transforming array buffer content to text`
                )
                return await this.parseFileContent(
                    new TextDecoder('utf-8').decode(loadedContent),
                    fileUrl,
                    currentProjection
                )
            }
            return await this.parseFileContent(loadedContent, fileUrl, currentProjection)
        }
        // no preloaded content, we load the file itself
        const fileContent = await getFileFromUrl(fileUrl, {
            ...options,
            // Reading zip archive as text is asking for trouble therefore we use ArrayBuffer (for KMZ)
            responseType: this.readFileAsText ? 'text' : 'arraybuffer',
        })
        return await this.parseFileContent(fileContent.data, fileUrl, currentProjection)
    }

    /**
     * @param {Object} config
     * @param {String | File} config.fileSource
     * @param {CoordinateSystem} config.currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @param {Object} [options]
     * @param {Number} [options.timeout] The timeout length (in milliseconds) to use when requesting
     *   online file
     * @param {Boolean} [options.allowServiceProxy=false] Flag telling if the resource could be
     *   accessed with the use of service-proxy if another means do not work (MIME type parsing or
     *   little endian signature detection). Default is `false`
     * @param {String} [options.mimeType] MIME type (from a Content-Type HTTP header) gathered from
     *   a previous HEAD request (so no need to re-run a HEAD request to get this info)
     * @param {ArrayBuffer} [options.loadedContent] File content already loaded (most likely by
     *   service-proxy). When given, no other request will be made on the file source, but this
     *   content will be used instead.
     * @returns {Promise<AbstractLayer>} A promise to layer config derived from the file's
     *   metadata/content, ready to be added to the map. Or a rejected promise if the file wasn't
     *   compatible.
     * @throws OutOfBoundsError if the imported file is out of bound of the current projection
     * @throws EmptyFileContentError if missing data (or no data) while reading the file
     */
    async parse(config = {}, options = {}) {
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
        throw false
    }
}
