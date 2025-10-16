import { allCoordinateSystems, extentUtils } from '@swissgeo/coordinates'
import { fromBlob, fromUrl } from 'geotiff'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import { LayerType, type CloudOptimizedGeoTIFFLayer } from '@swissgeo/layers'
import { v4 as uuidv4 } from 'uuid'

import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'

// see http://geotiff.maptools.org/spec/geotiff6.html#6.3.3.1
const USER_DEFINED_CS = 32767

export class CloudOptimizedGeoTIFFParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.tif', '.tiff'],
            fileTypeLittleEndianSignature: [
                // Standard TIFF
                [0x49, 0x49, 0x2a, 0x00],
                // BigTIFF
                [0x49, 0x49, 0x2b, 0x00],
            ],
            fileContentTypes: [
                'image/tiff',
                'image/tiff;subtype=geotiff',
                'application=geotiff',
                'application=geotiff; profile=cloud-optimized',
                'image/tiff; application=geotiff; profile=cloud-optimized',
            ],
            // loading an entire COG is asking for memory crashes, some can weight more than a terabyte
            shouldLoadOnlineContent: false,
            allowServiceProxy: false,
        })
    }

    async parseFileContent(
        _fileContent: ArrayBuffer | undefined,
        fileSource: File | string,
        currentProjection: CoordinateSystem
    ): Promise<CloudOptimizedGeoTIFFLayer> {
        let geoTIFFInstance
        if (this.isLocalFile(fileSource)) {
            geoTIFFInstance = await fromBlob(fileSource)
        } else {
            geoTIFFInstance = await fromUrl(fileSource)
        }
        if (!geoTIFFInstance) {
            throw new InvalidFileContentError('Could not parse COG from file source')
        }
        const firstImage = await geoTIFFInstance.getImage()
        const imageGeoKeys = firstImage.getGeoKeys()
        const imageGeoKey = imageGeoKeys?.ProjectedCSTypeGeoKey
        const imageGeoKeyName = imageGeoKeys?.GTCitationGeoKey ?? ''
        const cogProjection = allCoordinateSystems.find((coordinateSystem) => {
            if (imageGeoKey !== USER_DEFINED_CS) {
                return coordinateSystem.epsgNumber === imageGeoKey
            }
            return imageGeoKeyName.indexOf(coordinateSystem.technicalName) !== -1
        })
        if (!cogProjection) {
            throw new UnknownProjectionError(
                `Unknown projection found in COG EPSG:${imageGeoKey}`,
                `EPSG:${imageGeoKey}`
            )
        }
        const cogExtent = firstImage.getBoundingBox() as any
        const intersection = extentUtils.getExtentIntersectionWithCurrentProjection(
            cogExtent,
            cogProjection,
            currentProjection
        )
        if (!intersection) {
            throw new OutOfBoundsError(`COG is out of bounds of current projection: ${cogExtent}`)
        }

        const fileUrl = this.isLocalFile(fileSource) ? fileSource.name : fileSource
        const isLocalFile = this.isLocalFile(fileSource)

        const cogLayer: CloudOptimizedGeoTIFFLayer = {
            uuid: uuidv4(),
            id: `COG|${fileUrl}`,
            type: LayerType.COG,
            name: fileUrl,
            baseUrl: fileUrl,
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
            extent: extentUtils.flattenExtent(intersection),
            fileSource: fileUrl,
            data: fileSource,
            isLocalFile,
            hasError: false,
            hasWarning: false,
            isLoading: false,
            isExternal: !isLocalFile,
        }

        return cogLayer
    }
}
