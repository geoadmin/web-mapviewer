import type { Staging } from '@swissgeo/staging-config'

/**
 * Tells which (deployment) environment the app has been built with.
 *
 * @see https://en.wikipedia.org/wiki/Deployment_environment
 */
export const ENVIRONMENT: Staging = __VITE_ENVIRONMENT__ ?? 'development'

/** Flag that tells if the app is currently running in a Cypress environment for E2E testing */
export const IS_TESTING_WITH_CYPRESS: boolean = __IS_TESTING_WITH_CYPRESS__ ?? false

/** Current app version (from package.json) */
export const APP_VERSION: string = __APP_VERSION__ ?? 'Missing app version!'

/** The URL to the Github repository. */
export const GITHUB_REPOSITORY: string = 'https://github.com/geoadmin/web-mapviewer'

/** Display a big development banner on all but these hosts. */
export const NO_WARNING_BANNER_HOSTNAMES: string[] = ['test.map.geo.admin.ch', 'map.geo.admin.ch']

/**
 * Display a warning ribbon ('TEST') on the top-left (mobile) or bottom-left (desktop) corner on all
 * these hosts.
 */
export const WARNING_RIBBON_HOSTNAMES: string[] = ['test.map.geo.admin.ch']

/** Display Give Feedback on all these hosts */
export const GIVE_FEEDBACK_HOSTNAMES: string[] = [
    'localhost',
    'sys-map.dev.bgdi.ch',
    'test.map.geo.admin.ch',
]

/** Display Report Problem on all these hosts */
export const REPORT_PROBLEM_HOSTNAMES: string[] = [
    'localhost',
    'sys-map.dev.bgdi.ch',
    'sys-map.int.bgdi.ch',
    'sys-map.prod.bgdi.ch',
    'map.geo.admin.ch',
]
