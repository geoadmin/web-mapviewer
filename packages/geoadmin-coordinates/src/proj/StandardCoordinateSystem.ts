import { earthRadius } from '@turf/turf'

import CoordinateSystem, { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/proj/CoordinateSystem'

/**
 * Resolution (pixel/meter) found at zoom level 0 while looking at the equator. This constant is
 * used to calculate the resolution taking latitude into account. With Mercator projection, the
 * deformation increases when latitude increases.
 *
 * Length of the Earth around its equator (in meters) / 256 pixels
 *
 * @type {Number}
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES: number =
    (2 * Math.PI * earthRadius) / 256

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
export default abstract class StandardCoordinateSystem extends CoordinateSystem {
    /** The index in the resolution list where the 1:25000 zoom level is */
    get1_25000ZoomLevel(): number {
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }

    getDefaultZoom(): number {
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }
}
