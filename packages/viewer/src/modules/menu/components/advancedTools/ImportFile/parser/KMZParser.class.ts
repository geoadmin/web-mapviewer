import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'

import { kmlUtils } from '@swissgeo/api/utils'

import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'

const ZIP_FILE_LITTLE_ENDIAN_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]

/** Check if the input is a zipfile content or not */
export function isZipContent(content: ArrayBuffer): boolean {
    // Check the first 4 bytes for the ZIP file signature
    const view = new Uint8Array(content.slice(0, 4))
    for (let i = 0; i < ZIP_FILE_LITTLE_ENDIAN_SIGNATURE.length; i++) {
        if (view[i] !== ZIP_FILE_LITTLE_ENDIAN_SIGNATURE[i]) {
            return false
        }
    }
    return true
}

const kmlParser = new KMLParser()

export default class KMZParser extends FileParser<KMLLayer> {
    constructor() {
        super({
            fileExtensions: ['.kmz'],
            fileContentTypes: ['application/vnd.google-earth.kmz'],
            // ZIP file signature
            fileTypeLittleEndianSignature: [ZIP_FILE_LITTLE_ENDIAN_SIGNATURE],
            validateFileContent: isZipContent,
        })
    }

    async parseFileContent(
        data: ArrayBuffer | undefined,
        fileSource: string | File,
        currentProjection: CoordinateSystem
    ): Promise<KMLLayer> {
        if (!data) {
            throw new Error('No data provided for KMZ file')
        }
        const kmz = await kmlUtils.unzipKmz(
            data,
            this.isLocalFile(fileSource) ? fileSource.name : fileSource
        )
        const kmlName = kmz.name ?? (this.isLocalFile(fileSource) ? fileSource.name : fileSource)
        return kmlParser.parseFileContent(kmz.kml, kmlName, currentProjection, kmz.files, kmz.kmz)
    }
}
