import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { GPXLayer } from '@swissgeo/layers'

import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import GPX from 'ol/format/GPX'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { getGpxExtent } from '@/utils/gpxUtils'

/**
 * Checks if file is GPX
 */
export function isGpx(fileContent: ArrayBuffer): boolean {
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
            allowServiceProxy: true,
        })
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async parseFileContent(
        fileContent: ArrayBuffer | undefined,
        fileSource: File | string,
        currentProjection: CoordinateSystem
    ): Promise<GPXLayer> {
        if (!fileContent || !isGpx(fileContent)) {
            throw new InvalidFileContentError()
        }
        const gpxAsText = new TextDecoder('utf-8').decode(fileContent)
        const extent = getGpxExtent(gpxAsText)
        if (!extent) {
            throw new EmptyFileContentError()
        }
        const extentInCurrentProjection = extentUtils.getExtentIntersectionWithCurrentProjection(
            extent,
            WGS84,
            currentProjection
        )
        if (!extentInCurrentProjection) {
            throw new OutOfBoundsError(`GPX is out of bounds of current projection: ${extent.toString()}`)
        }

        const olGpxMetadata = (gpxMetadataParser.readMetadata(gpxAsText) ?? undefined)
        const gpxMetadata = olGpxMetadata ? {
            ...olGpxMetadata,
            bounds: olGpxMetadata.bounds && olGpxMetadata.bounds.length === 4
                ? olGpxMetadata.bounds as [number, number, number, number]
                : undefined
        } : undefined

        const gpxLayer: GPXLayer = layerUtils.makeGPXLayer({
            opacity: 1.0,
            isVisible: true,
            extent: extentInCurrentProjection,
            gpxData: gpxAsText,
            gpxMetadata,
        })

        return gpxLayer
    }
}
