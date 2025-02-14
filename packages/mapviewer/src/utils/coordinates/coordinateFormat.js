import { LV03, LV95, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { toRoundedString } from '@geoadmin/coordinates'
import { formatThousand } from '@geoadmin/numbers'
import { format as formatCoordinate, toStringHDMS } from 'ol/coordinate'
import proj4 from 'proj4'

import { latLonToMGRS, latLonToUTM } from '@/utils/militaryGridProjection'

/** Representation of coordinates in a human-readable format */
export class CoordinateFormat {
    /**
     * @param {String} id Used in the code to identify this coordinate format
     * @param {String} label Text shown to the user for this format
     * @param {CoordinateSystem} requiredInputProjection Which coordinate system coordinates must be
     *   in, in order to be formatted
     * @param {Number} decimalPoints
     * @param {Function} formatCallback Function that formats coordinates into a human-readable
     *   string (used by the format function of the instance)
     */
    constructor(
        id,
        label,
        requiredInputProjection = WEBMERCATOR,
        decimalPoints = 2,
        formatCallback
    ) {
        this.id = id
        this.label = label
        this.requiredInputProjection = requiredInputProjection
        this.decimalPoints = decimalPoints
        this.formatCallback = formatCallback ?? ((coordinates) => toRoundedString(coordinates, this.decimalPoints, true, true))
    }

    /**
     * Format given coordinates (represented in the given projection) to a human-readable string
     *
     * @param {Number[]} coordinates Coordinates such as [x,y]
     * @param {CoordinateSystem} projection Projection used to express the coordinates
     * @param {boolean} withExtra Flags that when set to true will output extra information if
     *   available
     * @returns {String} Human-readable representation of the coordinates
     */
    format(coordinates, projection, withExtra = false) {
        let reprojectedCoordinates = [...coordinates]
        if (projection && projection.epsg !== this.requiredInputProjection.epsg) {
            reprojectedCoordinates = proj4(
                projection.epsg,
                this.requiredInputProjection.epsg,
                coordinates
            )
        }
        return this.formatCallback(reprojectedCoordinates, withExtra)
    }
}

export const LV95Format = new CoordinateFormat('LV95', 'CH1903+ / LV95', LV95)
export const LV03Format = new CoordinateFormat('LV03', 'CH1903 / LV03', LV03)
export const WGS84Format = new CoordinateFormat(
    'WGS84',
    'WGS 84 (lat/lon)',
    WGS84,
    5,
    (coordinates, withPlain) => {
        let output = `${toStringHDMS(coordinates, 2)}`
        if (withPlain) {
            output += ` (${formatCoordinate(coordinates, '{y}, {x}', 5)})`
        }
        return output
    }
)
export const MercatorFormat = new CoordinateFormat('Mercator', 'WebMercator', WEBMERCATOR)
export const UTMFormat = new CoordinateFormat('UTM', 'UTM', WGS84, 5, (coordinates) => {
    let c = latLonToUTM(coordinates[1], coordinates[0])
    return [
        formatThousand(c.easting),
        formatThousand(c.northing),
        `(${c.zoneNumber}${c.zoneLetter})`,
    ].join(' ')
})
export const MGRSFormat = new CoordinateFormat('MGRS', 'MGRS', WGS84, 5, (coordinates) =>
    latLonToMGRS(coordinates[1], coordinates[0], 6)
        .replace(/(.{5})/g, '$1 ')
        .trim()
)

/** @type {CoordinateFormat[]} */
const allFormats = [LV95Format, LV03Format, WGS84Format, MercatorFormat, UTMFormat, MGRSFormat]

export default allFormats
