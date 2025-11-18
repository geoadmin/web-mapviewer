import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'

import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { WarningMessage } from '@swissgeo/log/Message'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { getKmlExtent, isKml, isKmlFeaturesValid } from '@/utils/kmlUtils'

export class KMLParser extends FileParser<KMLLayer> {
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

    /** @param linkFiles Used in the context of a KMZ to carry the embedded files with the layer */
    // eslint-disable-next-line @typescript-eslint/require-await
    async parseFileContent(
        fileContent: ArrayBuffer | undefined,
        fileSource: string | File,
        currentProjection: CoordinateSystem,
        linkFiles: Map<string, ArrayBuffer> = new Map()
    ): Promise<KMLLayer> {
        if (!fileContent || !isKml(fileContent)) {
            throw new InvalidFileContentError('No KML data found in this file')
        }
        const kmlAsText = new TextDecoder('utf-8').decode(fileContent)
        const extent = getKmlExtent(kmlAsText)
        if (!extent) {
            throw new EmptyFileContentError()
        }
        const extentInCurrentProjection = extentUtils.getExtentIntersectionWithCurrentProjection(
            extent,
            WGS84,
            currentProjection
        )
        if (!extentInCurrentProjection) {
            throw new OutOfBoundsError(
                `KML is out of bounds of current projection: ${extent.toString()}`
            )
        }

        const kmlFileUrl = this.isLocalFile(fileSource) ? fileSource.name : fileSource
        const internalFiles: Record<string, ArrayBuffer> = {}
        linkFiles.forEach((value, key) => {
            internalFiles[key] = value
        })

        const warningMessages: WarningMessage[] = []
        if (!isKmlFeaturesValid(kmlAsText)) {
            warningMessages.push(
                new WarningMessage('kml_malformed', {
                    filename: kmlFileUrl,
                })
            )
        }

        return layerUtils.makeKMLLayer({
            opacity: 1.0,
            isVisible: true,
            extent: extentInCurrentProjection,
            kmlFileUrl,
            kmlData: kmlAsText,
            extentProjection: currentProjection,
            warningMessages,
        })
    }
}
