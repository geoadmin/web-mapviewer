import { allCoordinateSystems, CoordinateSystem } from '@geoadmin/coordinates'
import { PhotometricInterpretation, PlanarConfiguration } from '@geoadmin/layers'
import { layerUtils } from '@geoadmin/layers/utils'
import { fromBlob, fromUrl } from 'geotiff'

import InvalidFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/InvalidFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
import FileParser from '@/modules/menu/components/advancedTools/ImportFile/parser/FileParser.class'
import { flattenExtent, getExtentIntersectionWithCurrentProjection } from '@/utils/extentUtils'

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
        fileContent: ArrayBuffer | null,
        fileSource: string | Blob,
        currentProjection: CoordinateSystem
    ) {
        let geoTIFFInstance

        if (this.isLocalFile(fileSource)) {
            geoTIFFInstance = await fromBlob(fileSource as File)
        } else {
            geoTIFFInstance = await fromUrl(fileSource as string)
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

        const cogExtent = firstImage.getBoundingBox()
        const intersection = getExtentIntersectionWithCurrentProjection(
            cogExtent as [number, number, number, number],
            cogProjection,
            currentProjection
        )

        if (!intersection) {
            throw new OutOfBoundsError(
                `COG is out of bounds of current projection: ${JSON.stringify(cogExtent)}`
            )
        }

        const isLocalFile = this.isLocalFile(fileSource)

        return layerUtils.makeCloudOptimizedGeoTIFFLayer({
            // if it's a local file (a blob), then we extract the name. Hence we can make
            // sure that the fileSource is not passed as a Blob
            fileSource: isLocalFile ? (fileSource as File).name : (fileSource as string),
            isVisible: true,
            opacity: 1.0,
            data: fileSource,
            noDataValue: firstImage.getGDALNoData() ?? undefined,
            // FIXME later on, if the utils are TS, this cast shouldn't be needed!
            extent: flattenExtent(intersection) as [number, number, number, number],
            imageFileDirectory: {
                artist: firstImage.fileDirectory.Artist as string,
                bitsPerSample: firstImage.fileDirectory.BitsPerSample as Uint16Array,
                compression: firstImage.fileDirectory.Compression as number,
                documentName: firstImage.fileDirectory.DocumentName as string,
                geoAsciiParams: firstImage.fileDirectory.GeoAsciiParams as string,
                geoKeyDirectory: firstImage.fileDirectory.GeoKeyDirectory as Uint16Array,
                imageLength: firstImage.fileDirectory.ImageLength as number,
                imageWidth: firstImage.fileDirectory.ImageWidth as number,
                jpegTables: firstImage.fileDirectory.JPEGTables as Uint8Array,
                maxSampleValue: firstImage.fileDirectory.MaxSampleValue as Uint16Array,
                minSampleValue: firstImage.fileDirectory.MinSampleValue as Uint16Array,
                photometricInterpretation: firstImage.fileDirectory
                    .PhotometricInterpretation as PhotometricInterpretation,
                planarConfiguration: firstImage.fileDirectory
                    .PlanarConfiguration as PlanarConfiguration,
                referenceBlackWhite: firstImage.fileDirectory.ReferenceBlackWhite as Uint32Array,
                resolutionUnit: firstImage.fileDirectory.ResolutionUnit as number,
                sampleFormat: firstImage.fileDirectory.SampleFormat as Uint16Array,
                samplesPerPixel: firstImage.fileDirectory.SamplesPerPixel as number,
                tileByteCounts: firstImage.fileDirectory.TileByteCounts as Uint32Array,
                tileLength: firstImage.fileDirectory.TileLength as number,
                tileOffsets: firstImage.fileDirectory.TileOffsets as Uint32Array,
                tileWidth: firstImage.fileDirectory.TileWidth as number,
                xResolution: firstImage.fileDirectory.XResolution as Uint32Array,
                yCbCrSubSampling: firstImage.fileDirectory.YCbCrCoefficients as Uint32Array,
                yResolution: firstImage.fileDirectory.YResolution as Uint32Array,
            },
        })
    }
}
