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
 * Don't show third party disclaimer for iframe with one of these hosts as src
 *
 * @type {String[]}
 */
export const WHITELISTED_HOSTNAMES = ['test.map.geo.admin.ch', 'map.geo.admin.ch']
