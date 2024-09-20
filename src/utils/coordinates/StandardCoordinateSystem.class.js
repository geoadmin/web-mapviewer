import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/CoordinateSystem.class'

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
    /**
     * The index in the resolution list where the 1:25000 zoom level is
     *
     * @returns {Number}
     */
    get1_25000ZoomLevel() {
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }

    getDefaultZoom() {
        return 8
    }
}
