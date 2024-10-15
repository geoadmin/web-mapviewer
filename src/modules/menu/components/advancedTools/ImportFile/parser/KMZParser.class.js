import { getFileFromUrl } from '@/api/files.api'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import { unzipKmz } from '@/utils/kmlUtils'

/**
 * Check if the input is a zipfile content or not
 *
 * @param {ArrayBuffer} content
 * @returns {boolean} Return true if the content is a zipfile content
 */
export function isZipContent(content) {
    // Check the first 4 bytes for the ZIP file signature
    const zipSignature = [0x50, 0x4b, 0x03, 0x04]
    const view = new Uint8Array(content.slice(0, 4))
    for (let i = 0; i < zipSignature.length; i++) {
        if (view[i] !== zipSignature[i]) {
            return false
        }
    }
    return true
}

const kmlParser = new KMLParser()

export default class KMZParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.kmz'],
            fileContentTypes: ['application/vnd.google-earth.kmz'],
            // ZIP file signature
            fileTypeLittleEndianSignature: [0x50, 0x4b, 0x03, 0x04],
            serviceProxyConfiguration: {
                validateContent: isZipContent,
            },
        })
    }

    /**
     * @param {String | ArrayBuffer} data
     * @param {String} fileSource
     * @param {CoordinateSystem} currentProjection
     * @returns {Promise<KMLLayer>}
     */
    async parseKmzLayer(data, fileSource, currentProjection) {
        const kmz = await unzipKmz(data, fileSource)
        return kmlParser.parseKmlLayer(kmz.kml, kmz.name, currentProjection, kmz.files)
    }

    async parseLocalFile(file, currentProjection) {
        return await this.parseKmzLayer(await file.arrayBuffer(), file.name, currentProjection)
    }

    async parseUrl(fileUrl, currentProjection, options) {
        const fileContent = await getFileFromUrl(fileUrl, {
            ...options,
            // Reading zip archive as text is asking for trouble therefore we use ArrayBuffer
            responseType: 'arraybuffer',
        })
        return await this.parseKmzLayer(fileContent.data, fileUrl, currentProjection)
    }
}
