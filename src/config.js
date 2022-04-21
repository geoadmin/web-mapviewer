// loading and exporting all values from the .env file as ES6 importable variables

/**
 * Enum that tells for which (deployment) environment the app has been built.
 *
 * @type {'development' | 'integration' | 'production'}
 * @see {@link https://en.wikipedia.org/wiki/Deployment_environment}
 */
export const ENVIRONMENT = VITE_ENVIRONMENT

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
export const APP_VERSION = __APP_VERSION__

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
export const API_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_API_BASE_URL)

/**
 * Base part of the URL to use when requesting icons.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_SERVICES_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICES_BASE_URL
)

/**
 * Base part of the URL to use for saving, updating or getting kml files.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_SERVICE_KML_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_KML_BASE_URL || API_PUBLIC_URL
)

/**
 * Base part of the URL to use for getting kml files.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type String
 */
export const API_SERVICE_KML_STORAGE_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_KML_STORAGE_BASE_URL || API_SERVICE_KML_BASE_URL
)

/**
 * Base part of the URL to communicate with service-shortlink backend
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type {String}
 */
export const API_SERVICE_SHORTLINK_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_APP_API_SERVICE_SHORTLINK_BASE_URL
)

/**
 * Base part of the URL to use when requesting GeoJSON data (e.g. for prod https://data.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type {String}
 */
export const DATA_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_DATA_BASE_URL)

/**
 * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod https://wmts.geo.admin.ch/).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * @type {String}
 */
export const WMTS_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_WMTS_BASE_URL)

/**
 * Default WMS base part of the URL to use when requesting tiles (e.g. for prod https://wms.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST endpoints
 *
 * WMS layers tend to carry their own base URL in their metadata, be mindful of that when using this
 * constant (it might be unnecessary)
 *
 * @type {String}
 */
export const WMS_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_WMS_BASE_URL)

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

/**
 * Map center default value is the center of switzerland LV:95 projection's extent (from
 * {@link https://epsg.io/2056}) re-projected in EPSG:3857
 */
export const MAP_CENTER = [915602.81, 5911929.47]

/**
 * Horizontal threshold for the phone view. (max-width) This will change the menu and also some interactions.
 *
 * The value is taken from the "sm" breakpoint from Bootstrap.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_WIDTH = 576
/**
 * Horizontal threshold for the phone view. (max-height) The height is needed to catch landscape
 * view on mobile.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_HEIGHT = 500
/**
 * Horizontal threshold for the tablet view. (max-width)
 *
 * @type {Number}
 */
export const BREAKPOINT_TABLET = 768

/**
 * The tolerance in pixel when testing if the cursor is over an element in drawing mode.
 *
 * @type {Number}
 */
export const DRAWING_HIT_TOLERANCE = 6
