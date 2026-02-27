import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'

import { kmlUtils } from '@swissgeo/api/utils'
import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { WarningMessage } from '@swissgeo/log/Message'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'

export class KMLParser extends FileParser<KMLLayer> {
    constructor() {
        super({
            fileExtensions: ['.kml'],
            fileContentTypes: [
                'application/vnd.google-earth.kml+xml',
                'application/xml',
                'text/xml',
            ],
            validateFileContent: kmlUtils.isKml,
            allowServiceProxy: true,
        })
    }

    /**
     * @param linkFiles Used in the context of a KMZ to carry the embedded files with the layer
     * @param [kmzContent] Content of the whole KMZ archive (untouched/zipped), if this
     *   layer is coming from a KMZ file. Necessary to load the layer inside the Cesium viewer (to
     *   have access to the linked files).
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async parseFileContent(
        fileContent: ArrayBuffer | string | undefined,
        fileSource: string | File,
        currentProjection: CoordinateSystem,
        linkFiles: Map<string, ArrayBuffer> = new Map(),
        kmzContent: ArrayBuffer = undefined
    ): Promise<KMLLayer> {
        if (!fileContent || !kmlUtils.isKml(fileContent)) {
            throw new InvalidFileContentError('No KML data found in this file')
        }
        let kmlAsText: string
        if (typeof fileContent === 'string') {
            kmlAsText = fileContent
        } else {
            kmlAsText = new TextDecoder('utf-8').decode(fileContent)
        }
        const extent = kmlUtils.getKmlExtent(kmlAsText)
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
        const kmlName = kmlUtils.parseKmlName(kmlAsText) ?? kmlFileUrl
        const internalFiles: Record<string, ArrayBuffer> = {}
        linkFiles.forEach((value, key) => {
            internalFiles[key] = value
        })

        const warningMessages: WarningMessage[] = []
        if (!kmlUtils.isKmlFeaturesValid(kmlAsText)) {
            warningMessages.push(
                new WarningMessage('kml_malformed', {
                    filename: kmlName,
                })
            )
        }

        return layerUtils.makeKMLLayer({
            name: kmlName,
            opacity: 1.0,
            isVisible: true,
            extent: extentInCurrentProjection,
            kmlFileUrl,
            kmlData: kmlAsText,
            kmzContent,
            extentProjection: currentProjection,
            warningMessages,
        })
    }
}
