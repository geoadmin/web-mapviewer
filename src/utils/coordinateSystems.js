import { toStringCH } from '@/utils/coordinateUtils'
import { forward as LLtoMGRS, LLtoUTM } from '@/utils/militaryGridProjection'
import { formatThousand } from '@/utils/numberUtils'
import { format, toStringHDMS } from 'ol/coordinate'

export class CoordinateSystem {
    /**
     * @param {String} id Identification of this coordinate system with a human-readable ID (i.e.
     *   LV95/WGS84/LV03/etc...)
     * @param {String} epsg EPSG:xxxx representation of this coordinate system
     * @param {Number} epsgNumber Same as EPSG but only the numerical part (without the "EPSG:")
     * @param {String} label Label to show users when they are dealing with this coordinate system
     * @param {Function} formatCallback Called when formatting coordinates (an array of numbers),
     *   default to 1 digit after coma if nothing is defined here
     */
    constructor(
        id,
        epsg,
        epsgNumber,
        label,
        formatCallback = (coordinate) => toStringCH(coordinate, 1)
    ) {
        this.id = id
        this.epsg = epsg
        this.epsgNumber = epsgNumber
        this.label = label
        this.format = formatCallback
    }
}

export const LV95 = new CoordinateSystem('LV95', 'EPSG:2056', 2056, 'CH1903+ / LV95')
export const LV03 = new CoordinateSystem('LV03', 'EPSG:21781', 21781, 'CH1903 / LV03')
export const WGS84 = new CoordinateSystem(
    'WGS84',
    'EPSG:4326',
    4326,
    'WGS 84 (lat/lon)',
    /**
     * @param {Number[]} coordinate Coordinates in WGS84 as [lat, lon] (OpenLayers function with a
     *   lat/lon system, not a lon/lat)
     * @returns {String} Human readable formatted coordinate
     */
    (coordinate) => `${toStringHDMS(coordinate, 2)} (${format(coordinate, '{y}, {x}', 5)})`
)
export const WEBMERCATOR = new CoordinateSystem(
    'WEBMERCATOR',
    'EPSG:3857',
    3857,
    'WebMercator',
    /**
     * @param {Number[]} coordinate Coordinates in WebMercator as [x, y]
     * @returns {String} Human readable formatted coordinate
     */
    (coordinate) => `${formatThousand(coordinate[0])} ${formatThousand(coordinate[1])}`
)

export const UTM = new CoordinateSystem(
    'UTM',
    'EPSG:4326',
    4326,
    'UTM',
    /**
     * @param {Number[]} coordinate Coordinates in WGS84 as [lat, lon] (OpenLayers function with a
     *   lat/lon system, not a lon/lat)
     * @returns {String} Human readable formatted coordinate in UTM (see
     *   https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system)
     */
    (coordinate) => {
        let c = LLtoUTM({ lat: coordinate[1], lon: coordinate[0] })
        return [
            formatThousand(c.easting),
            formatThousand(c.northing),
            `(${c.zoneNumber}${c.zoneLetter})`,
        ].join(' ')
    }
)
export const MGRS = new CoordinateSystem(
    'MGRS',
    'EPSG:4326',
    4326,
    'MGRS',
    /**
     * @param {Number[]} coordinate Coordinates in WGS84 as [lat, lon] (OpenLayers function with a
     *   lat/lon system, not a lon/lat)
     * @returns {String} Human readable formatted coordinate in the military grid reference system
     */
    (coordinate) =>
        // The replace function is used to have a space between the numbers
        LLtoMGRS(coordinate, 5)
            .replace(/(.{5})/g, '$1 ')
            .trim()
)

/**
 * Representation of many (available in this app) projection systems
 *
 * The format function helps print the coordinate in a human-readable format. It will receive the
 * coordinate reprojected in the declared EPSG for the coordinate system.
 */
const allCoordinateSystems = [
    LV95,
    LV03,
    WGS84,
    WEBMERCATOR,
    UTM,
    MGRS,
]
export default allCoordinateSystems
