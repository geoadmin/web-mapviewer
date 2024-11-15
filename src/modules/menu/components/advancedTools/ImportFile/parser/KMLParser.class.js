import KMLLayer from '@/api/layers/KMLLayer.class'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'
import { getKmlExtent } from '@/utils/kmlUtils'

/**
 * Checks if file is KMLs
 *
 * @param {ArrayBuffer} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    let stringValue = new TextDecoder('utf-8').decode(fileContent)
    return /^\s*(<\?xml\b[^>]*\?>)?\s*(<!--(.*?)-->\s*)*<(kml:)?kml\b[^>]*>[\s\S.]*<\/(kml:)?kml\s*>/g.test(
        stringValue
    )
}

export class KMLParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.kml'],
            fileContentTypes: [
                'application/vnd.google-earth.kml+xml',
                'application/xml',
                'text/xml',
            ],
            validateFileContent: isKml,
            allowServiceProxy: true,
        })
    }

    /**
     * @param {ArrayBuffer} fileContent
     * @param {String | File} fileSource
     * @param currentProjection
     * @param {Map<string, ArrayBuffer>} [linkFiles] Used in the context of a KMZ to carry the
     *   embedded files with the layer
     * @returns {Promise<KMLLayer>}
     */
    async parseFileContent(fileContent, fileSource, currentProjection, linkFiles = new Map()) {
        if (!isKml(fileContent)) {
            throw new InvalidFileContentError('No KML data found in this file')
        }
        const kmlAsText = new TextDecoder('utf-8').decode(fileContent)
        const extent = getKmlExtent(kmlAsText)
        if (!extent) {
            throw new EmptyFileContentError()
        }
        const extentInCurrentProjection = getExtentIntersectionWithCurrentProjection(
            extent,
            WGS84,
            currentProjection
        )
        if (!extentInCurrentProjection) {
            throw new OutOfBoundsError(`KML is out of bounds of current projection: ${extent}`)
        }
        return new KMLLayer({
            kmlFileUrl: this.isLocalFile(fileSource) ? fileSource.name : fileSource,
            visible: true,
            opacity: 1.0,
            adminId: null,
            kmlData: kmlAsText,
            extent: extentInCurrentProjection,
            extentProjection: currentProjection,
            linkFiles,
        })
    }
}
