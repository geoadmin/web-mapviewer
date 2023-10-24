import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import StandardCoordinateSystem, {
    PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES,
} from '@/utils/coordinates/StandardCoordinateSystem.class'
import { round } from '@/utils/numberUtils'

export default class WGS84CoordinateSystem extends StandardCoordinateSystem {
    constructor() {
        super(
            4326,
            'WGS 84 (lat/lon)',
            '+proj=longlat +datum=WGS84 +no_defs +type=crs',
            new CoordinateSystemBounds(
                -180.0,
                180.0,
                -90.0,
                90.0,
                // center of LV95's extent transformed with epsg.io website
                [8.239436, 46.832259]
            )
        )
    }

    roundCoordinateValue(value) {
        // a precision of 6 digits means we can track position with 0.111m accuracy
        // see http://wiki.gis.com/wiki/index.php/Decimal_degrees
        return round(value, 6)
    }

    /**
     * Formula comes from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
     *
     *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
     *
     * @param {Number} zoom
     * @param {[Number, Number]} center
     * @returns {Number}
     */
    getResolutionForZoomAndCenter(zoom, center) {
        return round(
            Math.abs(
                (PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES *
                    Math.cos((center[1] * Math.PI) / 180.0)) /
                    Math.pow(2, zoom)
            ),
            2
        )
    }

    /**
     * Calculating zoom level by reversing formula from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale :
     *
     *          resolution = 156543.03 * cos(latitude) / (2 ^ zoom level)
     *
     * So that
     *
     *          zoom level = log2( resolution / 156543.03 / cos(latitude) )
     *
     * @param {Number} resolution Resolution in meter/pixel
     * @param {Number[]} center As the use an equatorial constant to calculate the zoom level, we
     *   need to know the latitude of the position the resolution must be calculated at, as we need
     *   to take into account the deformation of the WebMercator projection (that is greater the
     *   further north we are)
     * @returns {Number}
     */
    getZoomForResolutionAndCenter(resolution, center) {
        return Math.abs(
            Math.log2(
                resolution /
                    PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES /
                    Math.cos((center[1] * Math.PI) / 180.0)
            )
        )
    }
}
