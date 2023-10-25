import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import StandardCoordinateSystem, {
    PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES,
} from '@/utils/coordinates/StandardCoordinateSystem.class'
import { round } from '@/utils/numberUtils'
import proj4 from 'proj4'

export default class WebMercatorCoordinateSystem extends StandardCoordinateSystem {
    constructor() {
        super(
            3857,
            'WebMercator',
            // matrix comes from https://epsg.io/3857.proj4
            '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
            // bounds are coming from https://epsg.io/3857
            new CoordinateSystemBounds(
                -20037508.34,
                20037508.34,
                -20048966.1,
                20048966.1,
                // center of LV95's extent transformed with epsg.io website
                [917209.87, 5914737.43]
            )
        )
    }

    roundCoordinateValue(value) {
        return round(value, 2)
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
        const centerInRad = proj4(this.epsg, WGS84.epsg, center).map(
            (coordinate) => (coordinate * Math.PI) / 180.0
        )
        return round(
            Math.abs(
                (PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(centerInRad[1])) /
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
     * @param {[Number, Number]} center As the use an equatorial constant to calculate the zoom
     *   level, we need to know the latitude of the position the resolution must be calculated at,
     *   as we need to take into account the deformation of the WebMercator projection (that is
     *   greater the further north we are)
     * @returns {Number}
     */
    getZoomForResolutionAndCenter(resolution, center) {
        const centerInRad = proj4(this.epsg, WGS84.epsg, center).map(
            (coordinate) => (coordinate * Math.PI) / 180.0
        )
        return Math.abs(
            Math.log2(
                resolution /
                    PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES /
                    Math.cos(centerInRad[1])
            )
        )
    }
}
