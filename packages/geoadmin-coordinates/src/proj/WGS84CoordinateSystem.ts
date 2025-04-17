import { round } from '@geoadmin/numbers'

import type { SingleCoordinate } from '@/utils'

import { PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES } from '@/proj/CoordinateSystem'
import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'
import StandardCoordinateSystem from '@/proj/StandardCoordinateSystem'

export default class WGS84CoordinateSystem extends StandardCoordinateSystem {
    constructor() {
        super({
            epsgNumber: 4326,
            label: 'WGS 84 (lat/lon)',
            // matrix comes from https://epsg.io/4326.proj4
            proj4transformationMatrix: '+proj=longlat +datum=WGS84 +no_defs +type=proj',
            bounds: new CoordinateSystemBounds({
                lowerX: -180.0,
                upperX: 180.0,
                lowerY: -90.0,
                upperY: 90.0,
                // center of LV95's extent transformed with epsg.io website
                customCenter: [8.239436, 46.832259],
            }),
            usesMercatorPyramid: true,
        })
    }

    roundCoordinateValue(value: number): number {
        // a precision of 6 digits means we can track position with 0.111m accuracy
        // see http://wiki.gis.com/wiki/index.php/Decimal_degrees
        return round(value, 6)
    }

    /**
     * Formula comes from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
     *
     *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
     */
    getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number {
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
     * Ensures an extent is in X,Y order (longitude, latitude).
     * If coordinates are in Y,X order (latitude, longitude), swaps them.
     * WGS84 traditionally uses latitude-first (Y,X) axis order [minY, minX, maxY, maxX]
     * Some WGS84 implementations may use X,Y order therefore we need to check and swap if needed.
     * 
     * TODO: This method works for the common coordinates in and around switzerland but will not work for the whole world.
     *       Therefore a better solution should be implemented if we want to support coordinates and extents of the whole world.
     * 
     * @link Problem description https://docs.geotools.org/latest/userguide/library/referencing/order.html
     * @param extent - Input extent [minX, minY, maxX, maxY] or [minY, minX, maxY, maxX]
     * @returns Extent guaranteed to be in [minX, minY, maxX, maxY] order
     */
    getExtentInOrderXY(extent: [number, number, number, number]): [number, number, number, number] {
        if (extent[0] > extent[1]) {
            return [extent[1], extent[0], extent[3], extent[2]]
        }
        return extent
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
        return Math.abs(
            Math.log2(
                resolution /
                PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES /
                Math.cos((center[1] * Math.PI) / 180.0)
            )
        )
    }
}
