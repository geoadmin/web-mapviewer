import { LV95_RESOLUTIONS } from '@/config'
import { round } from '@/utils/numberUtils'

/**
 * WebMercator zoom level corresponding to the resolution of the 1:25'000 map we provide
 *
 * @type {Number}
 */
export const MERCATOR_ZOOM_LEVEL_1_25000_MAP = 15.5

/**
 * Equatorial radius of the Earth, in meters
 *
 * See https://en.wikipedia.org/wiki/Equator#Exact_length
 *
 * And https://en.wikipedia.org/wiki/World_Geodetic_System#WGS_84
 *
 * @type {Number}
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
 * See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 *
 * @type {Number}
 */
const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES = WGS84_EQUATOR_LENGTH_IN_METERS / 256

/**
 * Conversion matrix from swisstopo LV95 zoom level to Web Mercator zoom level
 *
 * Indexes of the array are LV95 zoom levels
 *
 * Values are mercator equivalents
 *
 * @type {Number[]}
 */
export const swisstopoPyramidZoomToMercatorZoomMatrix = [
    7.35, // 0
    7.75, // 1
    8.75,
    10,
    11,
    12.5,
    13.5,
    14.5,
    MERCATOR_ZOOM_LEVEL_1_25000_MAP,
    15.75,
    16.7,
    17.75,
    18.75,
    20,
    21,
]

/**
 * Mapping between Swiss map zooms and Web Mercator zooms. Copy/pasted from [MapUtilsService.js on
 * mf-geoadmin3]{@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631}
 *
 * @param {String | Number} swisstopoPyramidZoom A zoom level as desribed in [our backend's
 *   doc]{@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}
 * @returns {Number} A web-mercator zoom level (as described on [OpenStreetMap's
 *   wiki]{@link https://wiki.openstreetmap.org/wiki/Zoom_levels}) or null if the input is not a
 *   valid swisstopo pyramid zoom level
 */
export const translateSwisstopoPyramidZoomToMercatorZoom = (swisstopoPyramidZoom) => {
    const key = Math.floor(parseFloat(swisstopoPyramidZoom))
    if (swisstopoPyramidZoomToMercatorZoomMatrix.length - 1 >= key) {
        return swisstopoPyramidZoomToMercatorZoomMatrix[key]
    }
    // if no matching zoom level was found, we return the one for the 1:25'000 map
    return MERCATOR_ZOOM_LEVEL_1_25000_MAP
}

/**
 * Mapping between Web-Mercator zoom levels and Swiss map zooms. It will find the closest (ceil)
 * LV95 zoom level for the given mercator zoom
 *
 * @param {Number} mercatorZoom
 * @returns {Number}
 */
export const translateMercatorZoomToSwisstopoPyramidZoom = (mercatorZoom) => {
    // checking first if the mercator zoom level is within range of LV95 zoom we have available
    if (
        mercatorZoom >= swisstopoPyramidZoomToMercatorZoomMatrix[0] &&
        mercatorZoom <= swisstopoPyramidZoomToMercatorZoomMatrix[14]
    ) {
        return swisstopoPyramidZoomToMercatorZoomMatrix.filter((zoom) => zoom < mercatorZoom).length
    }
    if (mercatorZoom < swisstopoPyramidZoomToMercatorZoomMatrix[0]) {
        return 0
    }
    if (mercatorZoom > swisstopoPyramidZoomToMercatorZoomMatrix[14]) {
        return 14
    }
    // if no matching zoom level was found, we return the one for the 1:25'000 map
    return 8
}

/**
 * Returns the closest zoom level for the given resolution. The zoom level returned by this function
 * will always be an integer, so that it matches the tile resolution for our maps (no up-scaling or
 * down-scaling)
 *
 * If the resolution is far too big (Switzerland very tiny on the map), the furthest zoom level for
 * LV95 will be returned (0) that correspond to the 1:1'000'000 map, but no further than that.
 *
 * @param {Number} resolution
 */
export const getSwisstopoPyramidZoomForResolution = (resolution) => {
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
 * @param latitudeInRad As the use an equatorial constant to calculate the zoom level, we need to
 *   know the latitude of the position the resolution must be calculated at, as we need to take into
 *   account the deformation of the WebMercator projection (that is greater the further north we
 *   are)
 * @returns {number}
 */
export const calculateWebMercatorZoom = (resolution, latitudeInRad) => {
    //
    return Math.abs(
        Math.log2(
            resolution / PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES / Math.cos(latitudeInRad)
        )
    )
}

/**
 * Formula comes from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 *
 *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
 *
 * @param mercatorZoomLevel
 * @param latitudeInRad
 * @returns {Number}
 */
export const calculateWebMercatorResolution = (mercatorZoomLevel, latitudeInRad) => {
    return round(
        Math.abs(
            (PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latitudeInRad)) /
                Math.pow(2, mercatorZoomLevel)
        ),
        2
    )
}
