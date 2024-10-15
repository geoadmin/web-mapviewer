import { getFileFromUrl } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'
import { getKmlExtent } from '@/utils/kmlUtils'

/**
 * Checks if file is KMLs
 *
 * @param {ArrayBuffer | String} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    let stringValue = fileContent
    if (fileContent instanceof ArrayBuffer) {
        stringValue = new TextDecoder('utf-8').decode(fileContent)
    }
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
            serviceProxyConfiguration: {
                validateContent: isKml,
            },
        })
    }

    /**
     * @param {String} fileContent
     * @param fileSource
     * @param currentProjection
     * @param {Map<string, ArrayBuffer>} [linkFiles] Used in the context of a KMZ to carry the
     *   embedded files with the layer
     * @returns {KMLLayer}
     */
    parseKmlLayer(fileContent, fileSource, currentProjection, linkFiles = new Map()) {
        if (isKml(fileContent)) {
            const extent = getKmlExtent(fileContent)
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
                kmlFileUrl: fileSource,
                visible: true,
                opacity: 1.0,
                adminId: null,
                kmlData: fileContent,
                extent: extentInCurrentProjection,
                extentProjection: currentProjection,
                linkFiles,
            })
        }

        throw new EmptyFileContentError('No KML data found in this file')
    }

    async parseLocalFile(file, currentProjection) {
        return this.parseKmlLayer(
            new TextDecoder('utf-8').decode(await file.arrayBuffer()),
            file.name,
            currentProjection
        )
    }

    async parseUrl(fileUrl, currentProjection, options) {
        const fileContent = await getFileFromUrl(fileUrl, options)
        return this.parseKmlLayer(fileContent.data, fileUrl, currentProjection)
    }
}
