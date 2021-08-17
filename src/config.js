// loading and exporting all values from the .env file as ES6 importable variables

/**
 * Flag that tells if the app is currently in debug mode (a.k.a. built in dev mode)
 *
 * @type Boolean
 */
export const DEBUG = process.env.VUE_APP_DEBUG

/**
 * Flag that tells if the app is currently running in a Cypress environment for E2E testing
 *
 * @type Boolean
 */
export const IS_TESTING_WITH_CYPRESS = !!window.Cypress

/**
 * Current app version (from package.json)
 *
 * @type {String}
 */
export const APP_VERSION = process.env.PACKAGE_VERSION

/**
 * Adds a slash at the end of the URL if there is none
 *
 * @param {String} url
 * @returns {String} The URL with a trailing slash
 */
function enforceEndingSlashInUrl(url) {
    if (url && !url.endsWith('/')) {
        return `${url}/`
    }
    return url
}

/**
 * Base part of the URL to use when requesting the backend (e.g. for prod https://api3.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_BASE_URL = enforceEndingSlashInUrl(process.env.VUE_APP_API_BASE_URL)

/**
 * Public URL to get saved files (e.g. for prod https://public.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_PUBLIC_URL = enforceEndingSlashInUrl(process.env.VUE_APP_API_PUBLIC_URL)

/**
 * Base part of the URL to use when requesting icons.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_SERVICE_ICON_BASE_URL = enforceEndingSlashInUrl(
    process.env.VUE_APP_API_SERVICE_ICON_BASE_URL
)

/**
 * Base part of the URL to use when requesting GeoJSON data (e.g. for prod https://data.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type {String}
 */
export const DATA_BASE_URL = enforceEndingSlashInUrl(process.env.VUE_APP_DATA_BASE_URL)

/**
 * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod
 * https://wmts{5-9}.geo.admin.ch/).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type {String}
 */
export const WMTS_BASE_URL = enforceEndingSlashInUrl(process.env.VUE_APP_WMTS_BASE_URL)

/**
 * Default WMS base part of the URL to use when requesting tiles (e.g. for prod
 * https://wms{0-4}.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * WMS layers tend to carry their own base URL in their metadata, be mindful of that when using this
 * constant (it might be unnecessary)
 *
 * @type {String}
 */
export const WMS_BASE_URL = enforceEndingSlashInUrl(process.env.VUE_APP_WMS_BASE_URL)

/**
 * Default tile size to use when requesting WMS tiles with our internal WMSs (512px)
 *
 * Comes from {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/map/TileGrid.js}
 *
 * @type {Number}
 */
export const WMS_TILE_SIZE = 512 // px

/**
 * Origin of the TileGrid (comes from
 * {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/mk/config.mk}) reprojected in EPSG:3857 (WGS84)
 *
 * Was [2420000, 1350000] (LV95), is now [558147.8, 6152731.53]
 *
 * @type {Number[]}
 */
export const TILEGRID_ORIGIN = [558147.8, 6152731.53]

/**
 * Resolutions steps (one per zoom level) for our own WMTS pyramid (see
 * {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}) expressed in meters/pixel
 *
 * Be mindful that zoom levels described on our doc are expressed for LV95 and need conversion to
 * World Wide zoom level (see {@link translateSwisstopoPyramidZoomToMercatorZoom})
 *
 * @type {Number[]}
 */
export const TILEGRID_RESOLUTIONS = [
    4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500,
    250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1,
]
