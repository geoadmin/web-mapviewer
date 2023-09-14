import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { toRoundedString } from '@/utils/coordinates/coordinateUtils'
import { latLonToMGRS, latLonToUTM } from '@/utils/militaryGridProjection'
import { formatThousand } from '@/utils/numberUtils'
import { format as formatCoordinate, toStringHDMS } from 'ol/coordinate'
import proj4 from 'proj4'

/**
 * Representation of coordinates in a human-readable format
 */
export class CoordinateFormat {
    /**
     * @param {String} id Used in the code to identify this coordinate format
     * @param {String} label Text shown to the user for this format
     * @param {CoordinateSystem} requiredInputProjection Which coordinate system coordinates must be in, in order to be formatted
     * @param {Function} formatCallback Function that formats coordinates into a human-readable string (used by the format function of the instance)
     */
    constructor(
        id,
        label,
        requiredInputProjection = WEBMERCATOR,
        formatCallback = (coordinates) => toRoundedString(coordinates, 2)
    ) {
        this.id = id
        this.label = label
        this.requiredInputProjection = requiredInputProjection
        this.formatCallback = formatCallback
    }

    /**
     * Format given coordinates (represented in the given projection) to a human-readable string
     * @param {Number[]} coordinates Coordinates such as [x,y]
     * @param {CoordinateSystem} projection Projection used to express the coordinates
     * @return {String} Human-readable representation of the coordinates
     */
    format(coordinates, projection) {
        let reprojectedCoordinates = [...coordinates]
        if (projection && projection.epsg !== this.requiredInputProjection.epsg) {
            reprojectedCoordinates = proj4(
                projection.epsg,
                this.requiredInputProjection.epsg,
                coordinates
            )
        }
        return this.formatCallback(reprojectedCoordinates)
    }
}

export const LV95Format = new CoordinateFormat('LV95', 'CH1903+ / LV95', LV95, (coordinates) =>
    toRoundedString(coordinates, 2)
)
export const LV03Format = new CoordinateFormat('LV03', 'CH1903 / LV03', LV03, (coordinates) =>
    toRoundedString(coordinates, 2)
)
export const WGS84Format = new CoordinateFormat(
    'WGS84',
    'WGS 84 (lat/lon)',
    WGS84,
    (coordinates) =>
        `${toStringHDMS(coordinates, 2)} (${formatCoordinate(coordinates, '{y}, {x}', 5)})`
)
export const MercatorFormat = new CoordinateFormat(
    'Mercator',
    'WebMercator',
    WEBMERCATOR,
    (coordinates) => toRoundedString(coordinates, 2)
)
export const UTMFormat = new CoordinateFormat('UTM', 'UTM', WGS84, (coordinates) => {
    let c = latLonToUTM(coordinates[1], coordinates[0])
    return [
        formatThousand(c.easting),
        formatThousand(c.northing),
        `(${c.zoneNumber}${c.zoneLetter})`,
    ].join(' ')
})
export const MGRSFormat = new CoordinateFormat('MGRS', 'MGRS', WGS84, (coordinates) =>
    latLonToMGRS(coordinates[1], coordinates[0], 5)
        .replace(/(.{5})/g, '$1 ')
        .trim()
)

/**
 * @type {CoordinateFormat[]}
 */
const allFormats = [LV95Format, LV03Format, WGS84Format, MercatorFormat, UTMFormat, MGRSFormat]

export default allFormats
