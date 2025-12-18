import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Staging } from '@swissgeo/staging-config'

import { LV95 } from '@swissgeo/coordinates'

/** Default projection to be used throughout the application */
export const DEFAULT_PROJECTION: CoordinateSystem = LV95

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

/** Path to the cesium static assets */
export const CESIUM_STATIC_PATH = __CESIUM_STATIC_PATH__
