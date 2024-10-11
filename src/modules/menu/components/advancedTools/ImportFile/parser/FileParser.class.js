import axios from 'axios'

import { getContentThroughServiceProxy } from '@/api/file-proxy.api'
import log from '@/utils/logging'

/**
 * @function
 * @typedef ValidateProxifyContent
 *
 *   Function receiving the content from service-proxy, and assessing if it is a match for this parser
 * @param {ArrayBuffer} content
 * @returns {Boolean} Content is a match for this parser, or not
 */

/**
 * @typedef ServiceProxyConfiguration
 * @property {ValidateProxifyContent} validateContent
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
     * @param {ServiceProxyConfiguration} [config.serviceProxyConfiguration=null] If set,
     *   service-proxy will be used to get the file content if first request on the URL failed.
     *   Content of the proxifyed request will be checked against the ValidateProxifyContent before
     *   going through the parsing. Default is `null`
     */
    constructor(config = {}) {
        const {
            fileTypeLittleEndianSignature = [],
            fileExtensions = [],
            fileContentTypes = [],
            serviceProxyConfiguration = null,
        } = config
        this.fileTypeLittleEndianSignature = fileTypeLittleEndianSignature
        this.fileExtensions = fileExtensions
        this.fileContentTypes = fileContentTypes
        this.serviceProxyConfiguration = serviceProxyConfiguration
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
     * @abstract
     * @param {File} file
     * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @returns {Promise<AbstractLayer>}
     */
    async parseLocalFile(file, currentProjection) {
        throw new Error(`Parser not yet implemented ${file} ${currentProjection}`)
    }

    /**
     * @param {String} fileUrl
     * @returns {Promise<ArrayBuffer>}
     */
    async getContentThroughServiceProxy(fileUrl) {
        if (!this.serviceProxyConfiguration) {
            throw new Error('No service-proxy configuration for this parser')
        }
        // service proxy will stream the response, so we will only receive Content-Type application/binary
        // we need to check the content of what is returned
        return await getContentThroughServiceProxy(fileUrl)
    }

    /**
     * @param {ArrayBuffer} fileArrayBuffer
     * @returns {Boolean}
     */
    validateContentThroughServiceProxy(fileArrayBuffer) {
        if (!this.serviceProxyConfiguration) {
            return false
        }
        // service proxy will stream the response, so we will only receive Content-Type application/binary
        // we need to check the content of what is returned
        return this.serviceProxyConfiguration.validateContent(fileArrayBuffer)
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

        if (mimeType) {
            return this.fileContentTypes.includes(mimeType)
        }

        if (loadedContent) {
            return this.validateContentThroughServiceProxy(loadedContent)
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
                return this.validateContentThroughServiceProxy(
                    await getContentThroughServiceProxy(fileUrl)
                )
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
     * @param {String} fileUrl
     * @param {CoordinateSystem} currentProjection Can be used to check bounds of parsed file
     *   against the current projection (and raise OutOfBoundError in case no mutual data is
     *   available)
     * @param {Object} options
     * @param {Number} [options.timeout] The timeout length (in milliseconds) to use when requesting
     *   online file
     * @returns {Promise<AbstractLayer>}
     */
    async parseUrl(fileUrl, currentProjection, options = {}) {
        throw new Error(`Parser not yet implemented ${fileUrl} ${currentProjection} ${options}`)
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
