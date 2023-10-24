import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/SwissCoordinateSystem.class'

/**
 * Equatorial radius of the Earth, in meters
 *
 * @type {Number}
 * @see https://en.wikipedia.org/wiki/Equator#Exact_length
 * @see https://en.wikipedia.org/wiki/World_Geodetic_System#WGS_84
 */
const WGS84_SEMI_MAJOR_AXIS_A = 6378137.0

/**
 * Length of the Earth around its equator, in meters
 *
 * @type {Number}
 */
const WGS84_EQUATOR_LENGTH_IN_METERS = 2 * Math.PI * WGS84_SEMI_MAJOR_AXIS_A

/**
 * Resolution (pixel/meter) found at zoom level 0 while looking at the equator. This constant is
 * used to calculate the resolution taking latitude into account. With Mercator projection, the
 * deformation increases when latitude increases.
 *
 * @type {Number}
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES = WGS84_EQUATOR_LENGTH_IN_METERS / 256

/**
 * Coordinate system with a zoom level/resolution calculation based on the size of the Earth at the
 * equator.
 *
 * These will be used to represent WebMercator and WGS84 among others.
 *
 * @abstract
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export default class StandardCoordinateSystem extends CoordinateSystem {
    getDefaultZoom() {
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }
}
