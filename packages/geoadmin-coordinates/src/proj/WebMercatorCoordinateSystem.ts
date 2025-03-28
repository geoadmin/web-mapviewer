import { round } from '@geoadmin/numbers'
import proj4 from 'proj4'

import type { SingleCoordinate } from '@/utils'

import { WGS84 } from '@/proj'
import { PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES } from '@/proj/CoordinateSystem'
import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'
import StandardCoordinateSystem from '@/proj/StandardCoordinateSystem'

export default class WebMercatorCoordinateSystem extends StandardCoordinateSystem {
    constructor() {
        super({
            epsgNumber: 3857,
            label: 'WebMercator',
            // matrix comes from https://epsg.io/3857.proj4
            proj4transformationMatrix:
                '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=proj',
            // bounds are coming from https://github.com/geoadmin/lib-gatilegrid/blob/58d6e574b69d32740a24edbc086d97897d4b41dc/gatilegrid/tilegrids.py#L122-L125
            bounds: new CoordinateSystemBounds({
                lowerX: -20037508.342789244,
                upperX: 20037508.342789244,
                lowerY: -20037508.342789244,
                upperY: 20037508.342789244,
                // center of LV95's extent transformed with epsg.io website
                customCenter: [917209.87, 5914737.43],
            }),
            usesMercatorPyramid: true,
        })
    }

    roundCoordinateValue(value: number): number {
        return round(value, 2)
    }

    /**
     * Formula comes from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
     *
     *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
     */
    getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number {
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
     * @param resolution Resolution in meter/pixel
     * @param center As the use an equatorial constant to calculate the zoom level, we need to know
     *   the latitude of the position the resolution must be calculated at, as we need to take into
     *   account the deformation of the WebMercator projection (that is greater the further north we
     *   are)
     */
    getZoomForResolutionAndCenter(resolution: number, center: SingleCoordinate): number {
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
