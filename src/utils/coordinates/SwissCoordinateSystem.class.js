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
    650.0, 500.0, 250.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0.25, 0.1,
]

/**
 * Resolutions steps (one per zoom level) for our own WMTS pyramid (see
 * {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}) expressed in meters/pixel
 *
 * Be mindful that zoom levels described on our doc are expressed for LV95 and need conversion to
 * World Wide zoom level (see {@link SwissCoordinateSystem})
 *
 * It is essentially, at low resolution, the same as {@link LV95_RESOLUTIONS}, but with added steps
 * at higher zoom level (further from the ground)
 *
 * @type {Number[]}
 */
const TILEGRID_RESOLUTIONS = [
    4000.0,
    3750.0,
    3500.0,
    3250.0,
    3000.0,
    2750.0,
    2500.0,
    2250.0,
    2000.0,
    1750.0,
    1500.0,
    1250.0,
    1000.0,
    750.0,
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
    7.35, // min: 0
    7.75, // 1
    8.75, // 2
    10, // 3
    11, // 4
    12.5, // 5
    13.5, // 6
    14.5, // 7
    STANDARD_ZOOM_LEVEL_1_25000_MAP, // 8
    15.75, // 9
    16.7, // 10
    17.75, // 11
    18.75, // 12
    20, // 13
    21, // max: 14
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
    getResolutions() {
        return TILEGRID_RESOLUTIONS
    }

    getDefaultZoom() {
        return 1
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

    getResolutionForZoomAndCenter(zoom) {
        return LV95_RESOLUTIONS[Math.round(zoom)]
    }

    getZoomForResolutionAndCenter(resolution) {
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
