import { closest, round } from '@geoadmin/numbers'

import type { ResolutionStep } from '@/proj/types'

import {
    STANDARD_ZOOM_LEVEL_1_25000_MAP,
    SWISS_ZOOM_LEVEL_1_25000_MAP,
} from '@/proj/CoordinateSystem'
import CustomCoordinateSystem from '@/proj/CustomCoordinateSystem'

/**
 * Resolutions for each LV95 zoom level, from 0 to 14
 *
 * @see https://api3.geo.admin.ch/services/sdiservices.html#gettile
 */
export const LV95_RESOLUTIONS: number[] = [
    650.0, 500.0, 250.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.5, 2.0, 1.0, 0.5, 0.25, 0.1,
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
 */
export const SWISSTOPO_TILEGRID_RESOLUTIONS: number[] = [
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
    ...LV95_RESOLUTIONS.slice(0, 10),
    // see table https://api3.geo.admin.ch/services/sdiservices.html#gettile
    // LV95 doesn't support zoom level 10 at 1.5 resolution, so we need to split
    // the resolution and add it here
    1.5,
    ...LV95_RESOLUTIONS.slice(10),
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
export const SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX: number[] = [
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

const SWISSTOPO_ZOOM_TO_PRODUCT_SCALE: string[] = [
    "1:2'500'000", // zoom 0
    "1:2'500'000", // 1
    "1:1'000'000", // 2
    "1:1'000'000", // 3
    "1:500'000", // 4
    "1:200'000", // 5
    "1:100'000", // 6
    "1:50'000", // 7
    "1:25'000", // 8
    "1:25'000", // 9
    "1:10'000", // 10
    "1:10'000", // 11
    "1:10'000", // 12
    "1:10'000", // 13
    "1:10'000", // max zoom: 14
]

const swisstopoZoomLevels: number[] = SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX.map(
    (_, index) => index
)

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
    getResolutionSteps(): ResolutionStep[] {
        return SWISSTOPO_TILEGRID_RESOLUTIONS.map((resolution) => {
            const zoom: number | undefined = LV95_RESOLUTIONS.indexOf(resolution) ?? undefined
            let label: string | undefined
            if (zoom) {
                label = SWISSTOPO_ZOOM_TO_PRODUCT_SCALE[zoom]
            }
            return {
                zoom,
                label,
                resolution: resolution,
            }
        })
    }

    get1_25000ZoomLevel(): number {
        return SWISS_ZOOM_LEVEL_1_25000_MAP
    }

    getDefaultZoom(): number {
        return 1
    }

    transformStandardZoomLevelToCustom(standardZoomLevel: number): number {
        // checking first if the standard zoom level is within range of swiss zooms we have available
        if (
            typeof SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[0] === 'number' &&
            typeof SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[14] === 'number' &&
            standardZoomLevel >= SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[0] &&
            standardZoomLevel <= SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[14]
        ) {
            return SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX.filter(
                (zoom) => zoom < standardZoomLevel
            ).length
        }
        if (
            typeof SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[0] === 'number' &&
            standardZoomLevel < SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[0]
        ) {
            return 0
        }
        if (
            typeof SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[14] === 'number' &&
            standardZoomLevel > SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[14]
        ) {
            return 14
        }
        // if no matching zoom level was found, we return the one for the 1:25'000 map
        return this.get1_25000ZoomLevel()
    }

    /**
     * Mapping between Swiss map zooms and standard zooms. Heavily inspired by
     * {@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631 MapUtilsService.js on mf-geoadmin3}
     *
     * @param customZoomLevel A zoom level as desribed in
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts our backend's doc}
     * @returns A web-mercator zoom level (as described on
     *   {@link https://wiki.openstreetmap.org/wiki/Zoom_levels | OpenStreetMap's wiki}) or the zoom
     *   level to show the 1:25'000 map if the input is invalid
     */
    transformCustomZoomLevelToStandard(customZoomLevel: number): number {
        const key = Math.floor(customZoomLevel)
        if (SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX.length - 1 >= key) {
            return (
                SWISSTOPO_TILEGRID_ZOOM_TO_STANDARD_ZOOM_MATRIX[key] ??
                STANDARD_ZOOM_LEVEL_1_25000_MAP
            )
        }
        // if no matching zoom level was found, we return the one for the 1:25'000 map
        return STANDARD_ZOOM_LEVEL_1_25000_MAP
    }

    getResolutionForZoomAndCenter(zoom: number): number {
        const roundedZoom = Math.round(zoom)
        if (typeof LV95_RESOLUTIONS[roundedZoom] !== 'number') {
            return 0
        }
        // ignoring the center, as it won't have any effect on the chosen zoom level
        return LV95_RESOLUTIONS[roundedZoom]
    }

    getZoomForResolutionAndCenter(resolution: number): number {
        // ignoring the center, as it won't have any effect on the resolution
        const matchingResolution = LV95_RESOLUTIONS.find(
            (lv95Resolution) => lv95Resolution <= resolution
        )
        if (matchingResolution) {
            return LV95_RESOLUTIONS.indexOf(matchingResolution)
        }
        // if no match was found, we have to decide if the resolution is too great,
        // or too small to be matched and return the zoom accordingly
        const smallestResolution = LV95_RESOLUTIONS.slice(-1)[0]
        if (smallestResolution && smallestResolution > resolution) {
            // if the resolution was smaller than the smallest available, we return the zoom level corresponding
            // to the smallest available resolution
            return LV95_RESOLUTIONS.indexOf(smallestResolution)
        }
        // otherwise, we return the zoom level corresponding to the greatest resolution available
        return 0
    }

    roundCoordinateValue(value: number): number {
        return round(value, 2)
    }

    /**
     * Rounding to the zoom level
     *
     * @param customZoomLevel A zoom level, that could be a floating number
     * @param normalize Normalize the zoom level to the closest swisstopo zoom level, by default it
     *   only round the zoom level to 3 decimal
     * @returns A zoom level matching one of our national maps
     */
    roundZoomLevel(customZoomLevel: number, normalize: boolean = false): number {
        if (normalize) {
            return closest(customZoomLevel, swisstopoZoomLevels)
        }
        return super.roundZoomLevel(customZoomLevel)
    }
}
