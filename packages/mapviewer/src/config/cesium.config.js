import { get3dTilesBaseUrl } from '@/config/baseUrl.config'

/**
 * 3D terrain URL
 *
 * @type {string}
 */
export const TERRAIN_URL = `${get3dTilesBaseUrl()}/ch.swisstopo.terrain.3d/v1/`

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

/**
 * Distance on which depth test will be disabled for primitive to avoid cutting by terrain
 *
 * @type {number}
 */
export const PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE = 1.2742018 * 10 ** 7 // Diameter of Earth

/**
 * Minimum distance to ground on which tooltip will be shown on map. The tooltip placed is not
 * exactly correct when zooming close to the terrain
 * (https://github.com/CesiumGS/cesium/issues/3247) so it will be moved to floating window
 *
 * @type {number}
 */
export const MINIMUM_DISTANCE_TO_SHOW_TOOLTIP = 110000

export const GPX_BILLBOARD_RADIUS = 8

export const CESIUM_BUILDING_LAYER_ID = 'ch.swisstopo.swissbuildings3d.3d'
export const CESIUM_VEGETATION_LAYER_ID = 'ch.swisstopo.vegetation.3d'
export const CESIUM_CONSTRUCTIONS_LAYER_ID = 'ch.swisstopo.swisstlm3d.3d'
export const CESIUM_LABELS_LAYER_ID = 'ch.swisstopo.swissnames3d.3d'

/**
 * @returns {Object} A configuration for each layer id that should contain a property to be the id
 *   of each feature, an array of translated properties and an array of non translated properties
 */
function createTooltipConfig() {
    const nonTranslatedAttributesForTooltip = {}
    const translatedAttributesForTooltip = {}
    nonTranslatedAttributesForTooltip[CESIUM_BUILDING_LAYER_ID] = [
        'EGID',
        'GESAMTHOEHE',
        'DACH_MAX',
        'GELAENDEPUNKT',
    ]
    translatedAttributesForTooltip[CESIUM_BUILDING_LAYER_ID] = ['OBJEKTART']
    const paramsByCesiumLayerId = {}
    paramsByCesiumLayerId[CESIUM_BUILDING_LAYER_ID] = {
        id: 'EGID',
        data: {},
    }

    for (const layerId of Object.keys(paramsByCesiumLayerId)) {
        paramsByCesiumLayerId[layerId].data.nonTranslated = nonTranslatedAttributesForTooltip[
            layerId
        ].reduce((array, value) => ({ ...array, [layerId + '_' + value]: value }), {})
        paramsByCesiumLayerId[layerId].data.translated = translatedAttributesForTooltip[
            layerId
        ].reduce((array, value) => ({ ...array, [layerId + '_' + value]: value }), {})
    }
    return paramsByCesiumLayerId
}

export const CESIUM_LAYER_TOOLTIPS_CONFIGURATION = createTooltipConfig()
