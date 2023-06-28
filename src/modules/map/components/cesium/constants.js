import { BASE_URL_3D_TILES } from '@/config'

/**
 * 3D terrain URL
 *
 * @type {string}
 */
export const TERRAIN_URL = `${BASE_URL_3D_TILES}/ch.swisstopo.terrain.3d/v1/`

/**
 * The minimum distance in meters of the camera position from the terrain.
 *
 * @type {number}
 */
export const CAMERA_MIN_ZOOM_DISTANCE = 25

/**
 * The maximum distance in meters of the camera position from the terrain.
 *
 * @type {number}
 */
export const CAMERA_MAX_ZOOM_DISTANCE = 5000000

/**
 * The minimum camera pitch in radians.
 *
 * @type {number}
 */
export const CAMERA_MIN_PITCH = -Math.PI / 2

/**
 * The maximum camera pitch in radians.
 *
 * @type {number}
 */
export const CAMERA_MAX_PITCH = Math.PI / 4
