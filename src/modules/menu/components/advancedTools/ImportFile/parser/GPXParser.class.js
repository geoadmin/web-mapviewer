import GPX from 'ol/format/GPX'

import { getFileFromUrl } from '@/api/files.api'
import GPXLayer from '@/api/layers/GPXLayer.class'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'
import { getGpxExtent } from '@/utils/gpxUtils'

/**
 * Checks if file is GPX
 *
 * @param {ArrayBuffer | String} fileContent
 * @returns {boolean}
 */
export function isGpx(fileContent) {
    let stringValue = fileContent
    if (fileContent instanceof ArrayBuffer) {
        stringValue = new TextDecoder('utf-8').decode(fileContent)
    }
    return /<gpx/.test(stringValue) && /<\/gpx\s*>/.test(stringValue)
}

const gpxMetadataParser = new GPX()

export default class GPXParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.gpx'],
            fileContentTypes: ['application/gpx+xml', 'application/xml', 'text/xml'],
            serviceProxyConfiguration: {
                validateContent: isGpx,
            },
        })
    }

    parseGpxLayer(fileContent, fileSource, currentProjection) {
        const extent = getGpxExtent(fileContent)
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
            gpxData: fileContent,
            gpxMetadata: gpxMetadataParser.readMetadata(fileContent),
            extent: extentInCurrentProjection,
        })
    }

    async parseLocalFile(file, currentProjection) {
        return this.parseGpxLayer(
            new TextDecoder('utf-8').decode(await file.arrayBuffer()),
            file.name,
            currentProjection
        )
    }

    async parseUrl(fileUrl, currentProjection, options) {
        const fileContent = await getFileFromUrl(fileUrl, options)
        return this.parseGpxLayer(fileContent.data, fileUrl, currentProjection)
    }
}