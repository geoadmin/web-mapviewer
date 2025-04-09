export const BASE_URL_PROD = 'https://api3.geo.admin.ch/'
export const BASE_URL_INT = 'https://sys-api3.int.bgdi.ch/'
export const BASE_URL_DEV = 'https://sys-api3.dev.bgdi.ch/'

export type SupportedLocales = 'en' | 'de' | 'fr' | 'it' | 'rm'
// mimicing values from https://github.com/geoadmin/web-mapviewer/blob/36043456b820b03f380804a63e2cac1a8a1850bc/packages/mapviewer/src/config/staging.config.js#L1-L7
export type Staging = 'development' | 'integration' | 'production'

export const BORDER_COLOR = 'rgb(255, 99, 132)'
export const FILL_COLOR = 'rgba(255, 99, 132, 0.7)'

/**
 * 12.5 meters is what was used in the old viewer, see
 * https://github.com/geoadmin/mf-geoadmin3/blob/ce24a27b0ca8192a0f78f7b8cc07f4e231031304/src/components/GeomUtilsService.js#L207
 *
 * I tried lowering the value, but with the test GPX that were attached to the ticket PB-800, I get
 * the worst hiking time estimation when using something like 5m than if I use this 12.5 meters.
 */
export const GEOMETRY_SIMPLIFICATION_TOLERANCE = 12.5 // meters
