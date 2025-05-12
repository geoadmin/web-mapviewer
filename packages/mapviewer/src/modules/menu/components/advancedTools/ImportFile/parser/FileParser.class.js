import log from '@geoadmin/log'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl } from '@/api/files.api'

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
     * @param {Number[][]} config.fileTypeLittleEndianSignature Little endian signature (aka magic
     *   numbers), if any, for this file type. Will be used to check the first 4 bytes of the file.
     * @param {String[]} config.fileExtensions Which file extensions this file type is carried with
     *   (case-insensitive)
     * @param {String[]} config.fileContentTypes Which MIME types are typically associated with this
     *   file type. Will be used with one HTTP HEAD request on the file URL (if online file) to
     *   assert if this parser is the valid candidate for the file.
     * @param {Boolean} [config.shouldLoadOnlineContent=true] Flag telling if remote content should
     *   be loaded by this parser to properly parse it. If set to false, no GET (or proxy) request
     *   will be fired on the file URL. Default is `true`
     * @param {ValidateFileContent} [config.validateFileContent=null] Function receiving the content
     *   from a file (as ArrayBuffer), and assessing if it is a match for this parser. Default is
     *   `null`
     * @param {Boolean} [config.allowServiceProxy=false] Flag telling if the content of the file can
     *   be requested through service-proxy in case the server hosting the file doesn't support
     *   CORS. Default is `false`
     */
    constructor(config = {}) {
        const {
            fileTypeLittleEndianSignature = [],
            fileExtensions = [],
            fileContentTypes = [],
            shouldLoadOnlineContent = true,
            validateFileContent = null,
            allowServiceProxy = false,
        } = config
        this.fileTypeLittleEndianSignature = fileTypeLittleEndianSignature
        this.fileExtensions = fileExtensions
        this.fileContentTypes = fileContentTypes
        this.shouldLoadOnlineContent = shouldLoadOnlineContent
        this.validateFileContent = validateFileContent
        this.allowServiceProxy = allowServiceProxy
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
        if (
            fileArrayBuffer.byteLength >= 4 &&
            this.fileTypeLittleEndianSignature.length > 0 &&
            this.fileTypeLittleEndianSignature.every((signature) => signature.length === 4)
        ) {
            const littleEndianSignature = new Uint8Array(fileArrayBuffer.slice(0, 4))
            return this.fileTypeLittleEndianSignature.find((signature) =>
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

    /**
     * @param {File} file
     * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @returns {Promise<AbstractLayer>}
     */
    async parseLocalFile(file, currentProjection) {
        return this.parseFileContent(await file.arrayBuffer(), file, currentProjection)
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
     * @param {OnlineFileCompliance} [options.fileCompliance=null] Compliance check results that
     *   were previously gathered for this file. If not given, this function will run its own
     *   compliance checks. Default is `null`
     * @param {ArrayBuffer} [options.loadedContent] File content already loaded (most likely by
     *   service-proxy). When given, no other request will be made on the file source, but this
     *   content will be used instead.
     * @returns {Promise<Boolean>}
     */
    async isOnlineFileParsingPossible(fileUrl, options = {}) {
        const { fileCompliance = null, loadedContent = null } = options

        if (fileCompliance && this.fileContentTypes.includes(fileCompliance.mimeType)) {
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
            if (this.fileContentTypes.includes(mimeType)) {
                return true
            }
            // if no MIME type match and file content can be checked, we load it now
            if (this.shouldLoadOnlineContent) {
                try {
                    let loadedContent = null
                    if (supportsCORS && supportsHTTPS) {
                        loadedContent = await getFileContentFromUrl(fileUrl)
                    } else {
                        loadedContent = await getFileContentThroughServiceProxy(fileUrl)
                    }
                    return loadedContent && this.isFileContentValid(loadedContent)
                } catch (error) {
                    log.error(
                        `[FileParser][${this.constructor.name}] Could not load file content for`,
                        fileUrl,
                        error
                    )
                }
            }
        } catch (error) {
            log.warn(
                `[FileParser][${this.constructor.name}] HEAD request failed, could not parse`,
                fileUrl,
                this.constructor.name,
                error
            )
        }
        return false
    }

    /**
     * @abstract
     * @param {ArrayBuffer} fileContent
     * @param {File | String} fileSource
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
     * @param {ArrayBuffer} [options.loadedContent] File content already loaded (most likely by
     *   service-proxy). When given, no other request will be made on the file source, but this
     *   content will be used instead.
     * @param {OnlineFileCompliance} [options.fileCompliance=null] Compliance check results that
     *   were previously gathered for this file. If not given, this function will run its own
     *   compliance checks. Default is `null`
     * @returns {Promise<AbstractLayer>}
     */
    async parseUrl(fileUrl, currentProjection, options = {}) {
        const { loadedContent = null, fileCompliance = null } = options
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
            let fileContent = null
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
        return await this.parseFileContent(null, fileUrl, currentProjection)
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
     * @param {OnlineFileCompliance} [options.fileCompliance=null] Compliance check results that
     *   were previously gathered for this file. If not given, this function will run its own
     *   compliance checks. Default is `null`
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
