import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import { WarningMessage } from '@swissgeo/log/Message'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import { LayerType, type KMLLayer } from '@swissgeo/layers'
import { v4 as uuidv4 } from 'uuid'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { getKmlExtent, isKml, isKmlFeaturesValid } from '@/utils/kmlUtils'

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
     * @param linkFiles Used in the context of a KMZ to carry the
     *   embedded files with the layer
     * @param [kmzContent] Content of the whole KMZ archive (untouched/zipped), if this
     *   layer is coming from a KMZ file. Necessary to load the layer inside the Cesium viewer (to
     *   have access to the linked files).
     */
    async parseFileContent(
        fileContent: ArrayBuffer | undefined,
        fileSource: string | File,
        currentProjection: CoordinateSystem,
        linkFiles: Map<string, ArrayBuffer> = new Map(),
        kmzContent?: ArrayBuffer = undefined
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
            throw new OutOfBoundsError(`KML is out of bounds of current projection: ${extent}`)
        }

        const kmlFileUrl = this.isLocalFile(fileSource) ? fileSource.name : fileSource
        const isLocalFile = this.isLocalFile(fileSource)
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

        const kmlLayer: KMLLayer = {
            uuid: uuidv4(),
            id: `KML|${kmlFileUrl}`,
            type: LayerType.KML,
            name: kmlFileUrl,
            baseUrl: kmlFileUrl,
            opacity: 1.0,
            isVisible: true,
            attributions: [],
            hasTooltip: false,
            hasDescription: false,
            hasLegend: false,
            timeConfig: {
                timeEntries: [],
            },
            customAttributes: {},
            extent: extentInCurrentProjection,
            kmlFileUrl,
            kmlData: kmlAsText,
            kmzContent,
            clampToGround: true,
            isExternal: !isLocalFile,
            isLocalFile,
            internalFiles,
            extentProjection: currentProjection,
            adminId: undefined,
            warningMessages,
            hasError: false,
            hasWarning: warningMessages.length > 0,
            isLoading: false,
        }

        return kmlLayer
    }
}
