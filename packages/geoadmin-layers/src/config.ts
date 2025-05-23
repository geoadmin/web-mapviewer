export const BASE_URL_PROD = 'https://api3.geo.admin.ch/'
export const BASE_URL_INT = 'https://sys-api3.int.bgdi.ch/'
export const BASE_URL_DEV = 'https://sys-api3.dev.bgdi.ch/'

export const WMTS_BASE_URL_PROD = 'https://wmts.geo.admin.ch/'
export const WMTS_BASE_URL_INT = 'https://sys-wmts.int.bgdi.ch/'
export const WMTS_BASE_URL_DEV = 'https://sys-wmts.dev.bgdi.ch/'

// mimicing values from https://github.com/geoadmin/web-mapviewer/blob/36043456b820b03f380804a63e2cac1a8a1850bc/packages/mapviewer/src/config/staging.config.js#L1-L7
export type Staging = 'development' | 'integration' | 'production'

export const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5 // meters/pixel
