import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { round } from '@/utils/numberUtils'

/**
 * WebMercator zoom level corresponding to the resolution of the 1:25'000 map we provide
 *
 * @type {Number}
 */
export const STANDARD_ZOOM_LEVEL_1_25000_MAP = 15.5

/**
 * Resolutions for each LV95 zoom level, from 0 to 14
 *
 * @type {number[]}
 */
export const LV95_RESOLUTIONS = [
    650.0, 500.0, 250.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.5, 2.0, 1.0, 0.5, 0.25, 0.1,
]

/**
 * Origin of the TileGrid (comes from
 * {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/mk/config.mk})
 *
 * Is expressed as LV95 coordinates.
 *
 * @type {Number[]}
 */
export const TILEGRID_ORIGIN = [2420000, 1350000]

/**
 * Resolutions steps (one per zoom level) for our own WMTS pyramid (see
 * {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}) expressed in meters/pixel
 *
 * Be mindful that zoom levels described on our doc are expressed for LV95 and need conversion to
 * World Wide zoom level (see {@link SwissCoordinateSystem})
 *
 * @type {Number[]}
 */
export const TILEGRID_RESOLUTIONS = [
    4000,
    3750,
    3500,
    3250,
    3000,
    2750,
    2500,
    2250,
    2000,
    1750,
    1500,
    1250,
    1000,
    750,
    ...LV95_RESOLUTIONS,
]

/**
 * Conversion matrix from swisstopo LV95 zoom level to Web Mercator zoom level
 *
 * Indexes of the array are LV95 zoom levels
 *
 * Values are mercator equivalents
 *
 * @type {Number[]}
 */
export const swissPyramidZoomToStandardZoomMatrix = [
    7.35, // 0
    7.75, // 1
    8.75,
    10,
    11,
    12.5,
    13.5,
    14.5,
    STANDARD_ZOOM_LEVEL_1_25000_MAP,
    15.75,
    16.7,
    17.75,
    18.75,
    20,
    21,
]

/**
 * This specialization will be used to represent LV95 and LV03, that use a custom zoom/resolution
 * pyramid to match all our printable products (in contrast to {@link StandardCoordinateSystem} which
 * bases its zoom/resolution on the radius of the Earth at the equator and latitude positioning of
 * the map).
 *
 * @abstract
 * @see https://api3.geo.admin.ch/services/sdiservices.html#wmts
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export default class SwissCoordinateSystem extends CustomCoordinateSystem {
    getDefaultZoom() {
        return 2
    }

    transformStandardZoomLevelToCustom(standardZoomLevel) {
        // checking first if the standard zoom level is within range of swiss zooms we have available
        if (
            standardZoomLevel >= swissPyramidZoomToStandardZoomMatrix[0] &&
            standardZoomLevel <= swissPyramidZoomToStandardZoomMatrix[14]
        ) {
            return swissPyramidZoomToStandardZoomMatrix.filter((zoom) => zoom < standardZoomLevel)
                .length
        }
        if (standardZoomLevel < swissPyramidZoomToStandardZoomMatrix[0]) {
            return 0
        }
        if (standardZoomLevel > swissPyramidZoomToStandardZoomMatrix[14]) {
            return 14
        }
        // if no matching zoom level was found, we return the one for the 1:25'000 map
        return 8
    }

    /**
     * Mapping between Swiss map zooms and standard zooms. Heavily inspired by
     * {@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631 MapUtilsService.js on mf-geoadmin3}
     *
     * @param {String | Number} customZoomLevel A zoom level as desribed in
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts our backend's doc}
     * @returns {Number} A web-mercator zoom level (as described on
     *   {@link https://wiki.openstreetmap.org/wiki/Zoom_levels | OpenStreetMap's wiki}) or the zoom
     *   level to show the 1:25'000 map if the input is invalid
     */
    transformCustomZoomLevelToStandard(customZoomLevel) {
        const key = Math.floor(customZoomLevel)
        if (swissPyramidZoomToStandardZoomMatrix.length - 1 >= key) {
            return swissPyramidZoomToStandardZoomMatrix[key]
        }
        // if no matching zoom level was found, we return the one for the 1:25'000 map
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }

    getResolutionForZoomAndCenter(zoom, _) {
        return LV95_RESOLUTIONS[Math.round(zoom)]
    }

    getZoomForResolutionAndCenter(resolution, _) {
        const matchingResolution = LV95_RESOLUTIONS.find(
            (lv95Resolution) => lv95Resolution <= resolution
        )
        if (matchingResolution) {
            return LV95_RESOLUTIONS.indexOf(matchingResolution)
        }
        // if no match was found, we have to decide if the resolution is too great,
        // or too small to be matched and return the zoom accordingly
        const smallestResolution = LV95_RESOLUTIONS.slice(-1)[0]
        if (smallestResolution > resolution) {
            // if the resolution was smaller than the smallest available, we return the zoom level corresponding
            // to the smallest available resolution
            return LV95_RESOLUTIONS.indexOf(smallestResolution)
        }
        // otherwise, we return the zoom level corresponding to the greatest resolution available
        return 0
    }

    roundCoordinateValue(value) {
        return round(value, 2)
    }
}
