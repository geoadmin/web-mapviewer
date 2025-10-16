import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import GPX from 'ol/format/GPX'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import { LayerType, type GPXLayer } from '@swissgeo/layers'
import { v4 as uuidv4 } from 'uuid'

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
            throw new OutOfBoundsError(`GPX is out of bounds of current projection: ${extent}`)
        }

        const gpxFileUrl = this.isLocalFile(fileSource) ? fileSource.name : fileSource
        const isLocalFile = this.isLocalFile(fileSource)
        const gpxMetadata = (gpxMetadataParser.readMetadata(gpxAsText) ?? undefined) as any
        const attributionName = isLocalFile ? gpxFileUrl : new URL(gpxFileUrl).hostname
        const name = gpxMetadata?.name ?? 'GPX'

        const gpxLayer: GPXLayer = {
            uuid: uuidv4(),
            id: `GPX|${gpxFileUrl}`,
            type: LayerType.GPX,
            name,
            baseUrl: gpxFileUrl,
            opacity: 1.0,
            isVisible: true,
            attributions: [{ name: attributionName }],
            hasTooltip: false,
            hasDescription: false,
            hasLegend: false,
            timeConfig: {
                timeEntries: [],
            },
            customAttributes: {},
            extent: extentInCurrentProjection,
            gpxFileUrl,
            gpxData: gpxAsText,
            gpxMetadata,
            isExternal: !isLocalFile,
            hasError: false,
            hasWarning: false,
            isLoading: false,
        }

        return gpxLayer
    }
}
