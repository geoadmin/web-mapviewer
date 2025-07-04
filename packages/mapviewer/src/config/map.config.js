import { LV95 } from '@geoadmin/coordinates'

/**
 * Default projection to be used throughout the application
 *
 * @type {CoordinateSystem}
 */
export const DEFAULT_PROJECTION = LV95

/**
 * Default tile size to use when requesting WMS tiles with our internal WMSs (512px)
 *
 * Comes from
 * {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/map/TileGrid.js}
 *
 * @type {Number}
 */
export const WMS_TILE_SIZE = 512 // px

/**
 * WMS supported versions list
 *
 * @type {String[]}
 */
export const WMS_SUPPORTED_VERSIONS = ['1.3.0']

/**
 * Map default max resolution as it is set in mf-chsdi. Only layers with nonstandard resolutions
 * give their resolutions. In all other cases, we need to use this default value as the max
 * resolution.
 *
 * @type {Number}
 * @see https://github.com/geoadmin/mf-chsdi3/blob/0236814544a6bf2df86598889b81ee4023494325/chsdi/models/bod.py#L119-L123
 */
export const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5 // meters/pixel

/**
 * Map view's minimal resolution Currently set so that OL scalebar displays 10 meters Scalebar about
 * 1" on screen, hence about 100px. So, 10 meters/100px = 0.1 Caveat: setting resolution (minimum
 * and maximum) has the precedence over zoom (minimum/maximum)
 */
export const VIEW_MIN_RESOLUTION = 0.1 // meters/pixel

/**
 * The tolerance in pixel when testing if the cursor is over an element in drawing mode.
 *
 * @type {Number}
 */
export const DRAWING_HIT_TOLERANCE = 6

/**
 * How many features we will request our backends when identifying features under a single
 * coordinate (mouse click)
 *
 * @type {number}
 */
export const DEFAULT_FEATURE_COUNT_SINGLE_POINT = 10

/**
 * How many features we will request our backends when doing a rectangle selection on the map
 * (CLTR+drag)
 *
 * There's a hard limit of 50 on our backend.
 *
 * @type {number}
 * @see https://api3.geo.admin.ch/services/sdiservices.html#id10
 */
export const DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION = 50

/**
 * Path to the cesium static assets
 *
 * @type {string}
 */
export const CESIUM_STATIC_PATH = __CESIUM_STATIC_PATH__

/**
 * In pixels
 *
 * @type {Number}
 */
export const DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE = 10
