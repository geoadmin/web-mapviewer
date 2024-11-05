import GPX from 'ol/format/GPX'

import GPXLayer from '@/api/layers/GPXLayer.class'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'
import { getGpxExtent } from '@/utils/gpxUtils'

/**
 * Checks if file is GPX
 *
 * @param {ArrayBuffer} fileContent
 * @returns {boolean}
 */
export function isGpx(fileContent) {
    const stringValue = new TextDecoder('utf-8').decode(fileContent)
    return /<gpx/.test(stringValue) && /<\/gpx\s*>/.test(stringValue)
}

const gpxMetadataParser = new GPX()

export default class GPXParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.gpx'],
            fileContentTypes: ['application/gpx+xml', 'application/xml', 'text/xml'],
            validateFileContent: isGpx,
        })
    }

    async parseFileContent(fileContent, fileSource, currentProjection) {
        if (!isGpx(fileContent)) {
            throw new InvalidFileContentError()
        }
        const gpxAsText = new TextDecoder('utf-8').decode(fileContent)
        const extent = getGpxExtent(gpxAsText)
        if (!extent) {
            throw new EmptyFileContentError()
        }
        const extentInCurrentProjection = getExtentIntersectionWithCurrentProjection(
            extent,
            WGS84,
            currentProjection
        )
        if (!extentInCurrentProjection) {
            throw new OutOfBoundsError(`GPX is out of bounds of current projection: ${extent}`)
        }
        return new GPXLayer({
            gpxFileUrl: fileSource,
            visible: true,
            opacity: 1.0,
            gpxData: gpxAsText,
            gpxMetadata: gpxMetadataParser.readMetadata(gpxAsText),
            extent: extentInCurrentProjection,
        })
    }
}
