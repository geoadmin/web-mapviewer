import { type CoordinateSystem, LV95 } from '@geoadmin/coordinates'

/** Default projection to be used throughout the application */
export const DEFAULT_PROJECTION: CoordinateSystem = LV95

/**
 * Default tile size to use when requesting WMS tiles with our internal WMSs (512px)
 *
 * Comes from
 * {@link https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/map/TileGrid.js}
 */
export const WMS_TILE_SIZE: number = 512 // px

/**
 * Map view's minimal resolution Currently set so that OL scalebar displays 10 meters Scalebar about
 * 1" on screen, hence about 100px. So, 10 meters/100px = 0.1 Caveat: setting resolution (minimum
 * and maximum) has the precedence over zoom (minimum/maximum)
 */
export const VIEW_MIN_RESOLUTION: number = 0.1 // meters/pixel

/** The tolerance in pixel when testing if the cursor is over an element in drawing mode. */
export const DRAWING_HIT_TOLERANCE: number = 6

/**
 * How many features we will request our backends when identifying features under a single
 * coordinate (mouse click)
 */
export const DEFAULT_FEATURE_COUNT_SINGLE_POINT: number = 10

/**
 * How many features we will request our backends when doing a rectangle selection on the map
 * (CLTR+drag)
 *
 * There's a hard limit of 50 on our backend.
 *
 * @see https://api3.geo.admin.ch/services/sdiservices.html#id10
 */
export const DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION: number = 50

/** Path to the cesium static assets */
export const CESIUM_STATIC_PATH: string = __CESIUM_STATIC_PATH__

/** In pixels */
export const DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE: number = 10
