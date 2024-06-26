// loading and exporting all values from the .env file as ES6 importable variables

import { LV95 } from '@/utils/coordinates/coordinateSystems'

/**
 * Enum that tells for which (deployment) environment the app has been built.
 *
 * @type {'development' | 'integration' | 'production'}
 * @see https://en.wikipedia.org/wiki/Deployment_environment
 */
export const ENVIRONMENT = VITE_ENVIRONMENT

/**
 * Flag that tells if the app is currently running in a Cypress environment for E2E testing
 *
 * NOTE: this file might be imported by nodejs for external scripts therefore make sure that
 * `window` exists
 *
 * @type Boolean
 */
export const IS_TESTING_WITH_CYPRESS = typeof window !== 'undefined' ? !!window.Cypress : false

/**
 * Current app version (from package.json)
 *
 * @type {String}
 */
export const APP_VERSION = __APP_VERSION__

/**
 * Default projection to be used throughout the application
 *
 * @type {CoordinateSystem}
 */
export const DEFAULT_PROJECTION = LV95

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
 * Base part of the URL to be using service-proxy
 *
 * This URL always end with a slash, so there's no need at add another one after it to create REST
 * endpoints
 *
 * @type {String}
 */
export const API_SERVICE_PROXY_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_APP_SERVICE_PROXY_BASE_URL
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
 * Map view's minimal resolution Currently set so that OL scalebar displays 10 meters Scalebar about
 * 1" on screen, hence about 100px. So, 10 meters/100px = 0.1 Caveat: setting resolution (minimum
 * and maximum) has the precedence over zoom (minimum/maximum)
 */

export const VIEW_MIN_RESOLUTION = 0.1 // meters/pixel

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

export const VECTOR_TILE_BASE_URL = enforceEndingSlashInUrl(
    import.meta.env.VITE_APP_VECTORTILES_BASE_URL
)

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
 * Display a big development banner on all but these hosts.
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
 * WMS supported versions list
 *
 * @type {String[]}
 */
export const WMS_SUPPORTED_VERSIONS = ['1.3.0']

/**
 * Display Give Feedback on all these hosts
 *
 * @type {String[]}
 */
export const GIVE_FEEDBACK_HOSTNAMES = ['localhost', 'sys-map.dev.bgdi.ch', 'test.map.geo.admin.ch']

/**
 * Display Report Problem on all these hosts
 *
 * @type {String[]}
 */
export const REPORT_PROBLEM_HOSTNAMES = [
    'localhost',
    'sys-map.dev.bgdi.ch',
    'sys-map.int.bgdi.ch',
    'sys-map.prod.bgdi.ch',
    'map.geo.admin.ch',
]

/**
 * The oldest year in our system is from the layer Journey Through Time (ch.swisstopo.zeitreihen)
 * which has data from the year 1844
 *
 * @type {Number}
 */
export const OLDEST_YEAR = 1844

/**
 * The youngest (closest to now) year in our system, it will always be the previous year as of now
 *
 * @type {Number}
 */
export const YOUNGEST_YEAR = new Date().getFullYear()

/**
 * Don't show third party disclaimer for iframe with one of these hosts as src
 *
 * @type {String[]}
 */
export const WHITELISTED_HOSTNAMES = ['test.map.geo.admin.ch', 'map.geo.admin.ch']

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
 * The width under which we no longer use floating tooltips and enforce infoboxes.
 *
 * Found empirically, taking the tooltip width of 350px into account
 *
 * @type {Number}
 */
export const MAX_WIDTH_SHOW_FLOATING_TOOLTIP = 400
