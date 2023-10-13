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
 * Base part of the URL to use when requesting the api3.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_API_BASE_URL)

/**
 * Base part of the URL to use when requesting the alti service.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_SERVICE_ALTI_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_ALTI_BASE_URL
)

/**
 * Base part of the URL to use when requesting the search service.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_SERVICE_SEARCH_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_SEARCH_BASE_URL
)

/**
 * Base part of the URL to use when requesting icons.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_SERVICES_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICES_BASE_URL
)

/**
 * Base part of the URL to use for saving, updating or getting kml files.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_SERVICE_KML_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_KML_BASE_URL
)

/**
 * Base part of the URL to use for getting kml files.
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type String
 */
export const API_SERVICE_KML_STORAGE_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_API_SERVICE_KML_STORAGE_BASE_URL
)

/**
 * Base part of the URL to communicate with service-shortlink backend
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type {String}
 */
export const API_SERVICE_SHORTLINK_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_APP_API_SERVICE_SHORTLINK_BASE_URL
)

/**
 * Base part of the URL to use when requesting GeoJSON data (e.g. for prod
 * https://data.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type {String}
 */
export const DATA_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_DATA_BASE_URL)

/**
 * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod
 * https://wmts.geo.admin.ch/).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type {String}
 */
export const WMTS_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_WMTS_BASE_URL)

/**
 * Default WMS base part of the URL to use when requesting tiles (e.g. for prod
 * https://wms.geo.admin.ch).
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * WMS layers tend to carry their own base URL in their metadata, be mindful of that when using this
 * constant (it might be unnecessary)
 *
 * @type {String}
 */
export const WMS_BASE_URL = enforceEndingSlashInUrl(import.meta.env.VITE_WMS_BASE_URL)

/**
 * Root of the buckets serving 3D tiles
 *
 * @type {String}
 */
export const BASE_URL_3D_TILES = enforceEndingSlashInUrl(import.meta.env.VITE_APP_3D_TILES_BASE_URL)

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
 * Origin of the TileGrid (comes from
 * {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/mk/config.mk})
 *
 * Is expressed as LV95 coordinates.
 *
 * @type {Number[]}
 */
export const TILEGRID_ORIGIN = [2420000, 1350000]

/**
 * Resolutions for each LV95 zoom level, from 0 to 14
 * @type {number[]}
 */
export const LV95_RESOLUTIONS = [
    650.0, 500.0, 250.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.5, 2.0, 1.0, 0.5, 0.25, 0.1,
]

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
 * Map view's mininal resolution Currently set so that OL scalebar displays 10 meters Scalebar about
 * 1" on screen, hence about 100px. So, 10 meters/100px = 0.1 Caveat: setting resolution (mininum
 * and maximum) has the precedence over zoom (minimum/maximum)
 */

export const VIEW_MIN_RESOLUTION = 0.1 // meters/pixel

/**
 * Array of coordinates with bottom left / top right values of the extent. This can be used to
 * constrain OpenLayers (or other mapping framework) to only ask for tiles that are within the
 * extent. It should remove for instance the big white zone that are around the pixelkarte-farbe.
 *
 * This is a ripoff of
 * https://github.com/geoadmin/mf-geoadmin3/blob/0ec560069e93fdceb54ce126a3c2d0ef23a50f45/mk/config.mk#L140
 *
 * Those are coordinates expressed in EPSG:2056 (or LV95)
 *
 * @type {Number[]}
 */
export const TILEGRID_EXTENT = [2420000, 1030000, 2900000, 1350000]

/**
 * TILEGRID_EXTENT (defined above) reprojected in EPSG:4326 through epsg.io website.
 *
 * @type {Number[]}
 */
export const TILEGRID_EXTENT_EPSG_4326 = [5.1402988, 45.3981222, 11.4774363, 48.230617]

/**
 * Map center default value is the center of switzerland LV:95 projection's extent (from
 * {@link https://epsg.io/2056}) re-projected in EPSG:3857
 */
export const MAP_CENTER = [915602.81, 5911929.47]

/**
 * Horizontal threshold for the phone view. (min-width for tablet) This will change the menu and
 * also some interactions.
 *
 * The value is taken from the "sm" breakpoint from Bootstrap. If this value is modified, the
 * variable with the same name defined in 'src/scss/media-query.mixin' must also be modified.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_WIDTH = 576
/**
 * Horizontal threshold for the phone view. (min-height for tablet) The height is needed to catch
 * landscape view on mobile.
 *
 * If this value is modified, the variable with the same name defined in
 * 'src/scss/media-query.mixin' must also be modified.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_HEIGHT = 500
/**
 * Horizontal threshold for the tablet view. (min-width for desktop)
 *
 * If this value is modified, the variable with the same name defined in
 * 'src/scss/media-query.mixin' must also be modified.
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

/**
 * Light base map style ID
 *
 * From https://www.swisstopo.admin.ch/de/geodata/maps/smw/smw_lightbase.html
 *
 * @type {string}
 */
export const VECTOR_LIGHT_BASE_MAP_STYLE_ID = 'ch.swisstopo.leichte-basiskarte_world.vt'

/**
 * Imagery base map style ID
 *
 * From https://www.swisstopo.admin.ch/de/geodata/maps/smw/smw_imagerybase.html
 *
 * @type {string}
 */
export const VECTOR_TILES_IMAGERY_STYLE_ID = 'ch.swisstopo.leichte-basiskarte-imagery_world.vt'

/**
 * Display a big developpment banner on all but these hosts.
 *
 * @type {String[]}
 */
export const NO_WARNING_BANNER_HOSTNAMES = ['test.map.geo.admin.ch', 'map.geo.admin.ch']

/**
 * Display a warning ribbon ('TEST') on the top-left (mobile) or bottom-left (desktop) corner on all
 * these hosts.
 *
 * @type {String[]}
 */
export const WARNING_RIBBON_HOSTNAMES = ['test.map.geo.admin.ch']

/**
 * To avoid breaking legacy KML drawing during an MVP (test phases) we disable the drawing menu for
 * those ones on test.map.geo.admin.ch
 *
 * @type {String[]}
 */
export const DISABLE_DRAWING_MENU_FOR_LEGACY_ON_HOSTNAMES = [
    'test.map.geo.admin.ch',
    'sys-map.dev.bgdi.ch',
    'localhost',
]
