import { fromBlob, fromUrl } from 'geotiff'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class'
import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
import { flattenExtent, getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'

export class CloudOptimizedGeoTIFFParser extends FileParser {
    constructor() {
        super({
            fileExtensions: ['.tif', '.tiff'],
            fileTypeLittleEndianSignature: [0x49, 0x49, 0x2a, 0x00],
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

    async parseFileContent(fileContent, fileSource, currentProjection) {
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
        const imageGeoKey = firstImage.getGeoKeys()?.ProjectedCSTypeGeoKey
        const cogProjection = allCoordinateSystems.find(
            (coordinateSystem) => coordinateSystem.epsgNumber === imageGeoKey
        )
        if (!cogProjection) {
            throw new UnknownProjectionError(
                `Unknown projection found in COG EPSG:${imageGeoKey}`,
                `EPSG:${imageGeoKey}`
            )
        }
        const cogExtent = firstImage.getBoundingBox()
        const intersection = getExtentIntersectionWithCurrentProjection(
            cogExtent,
            cogProjection,
            currentProjection
        )
        if (!intersection) {
            throw new OutOfBoundsError(`COG is out of bounds of current projection: ${cogExtent}`)
        }
        return new CloudOptimizedGeoTIFFLayer({
            fileSource: this.isLocalFile(fileSource) ? fileSource.name : fileSource,
            visible: true,
            opacity: 1.0,
            data: fileSource,
            noDataValue: firstImage.getGDALNoData(),
            extent: flattenExtent(intersection),
        })
    }
}
