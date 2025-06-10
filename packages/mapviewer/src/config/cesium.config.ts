import { get3dTilesBaseUrl } from '@/config/baseUrl.config'

/** 3D terrain URL */
export const TERRAIN_URL: string = `${get3dTilesBaseUrl()}/ch.swisstopo.terrain.3d/v1/`

/** The minimum distance in meters of the camera position from the terrain. */
export const CAMERA_MIN_ZOOM_DISTANCE: number = 25

/** The maximum distance in meters of the camera position from the terrain. */
export const CAMERA_MAX_ZOOM_DISTANCE: number = 5000000

/** The minimum camera pitch in radians. */
export const CAMERA_MIN_PITCH: number = -Math.PI / 2

/** The maximum camera pitch in radians. */
export const CAMERA_MAX_PITCH: number = Math.PI / 4

/** Billboard horizontal offset to align it with the highlight */
export const DEFAULT_MARKER_HORIZONTAL_OFFSET: number = 40

/** Distance on which depth test will be disabled for primitive to avoid cutting by terrain */
export const PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE: number = 1.2742018 * 10 ** 7 // Diameter of Earth

/**
 * Minimum distance to ground on which tooltip will be shown on map. The tooltip placed is not
 * exactly correct when zooming close to the terrain
 * (https://github.com/CesiumGS/cesium/issues/3247) so it will be moved to floating window
 */
export const MINIMUM_DISTANCE_TO_SHOW_TOOLTIP: number = 110000

export const GPX_BILLBOARD_RADIUS: number = 8

export const CESIUM_BUILDING_LAYER_ID: string = 'ch.swisstopo.swissbuildings3d.3d'
export const CESIUM_VEGETATION_LAYER_ID: string = 'ch.swisstopo.vegetation.3d'
export const CESIUM_CONSTRUCTIONS_LAYER_ID: string = 'ch.swisstopo.swisstlm3d.3d'
export const CESIUM_LABELS_LAYER_ID: string = 'ch.swisstopo.swissnames3d.3d'

export interface LayerTooltipConfig {
    layerId: string
    /** The list of properties that need a translation */
    translatedKeys: string[]
    /** The list of properties that do not require a translation */
    nonTranslatedKeys: string[]
    /** Which parameter is used as the identifier of a feature */
    idParam: string
}

function createTooltipConfig(): LayerTooltipConfig[] {
    const buildingLayersTooltipConfig = {
        layerId: CESIUM_BUILDING_LAYER_ID,
        translatedKeys: ['OBJEKTART'],
        nonTranslatedKeys: ['EGID', 'GESAMTHOEHE', 'DACH_MAX', 'GELAENDEPUNKT'],
        idParam: 'EGID',
    }

    const tooltipsConfig = []
    tooltipsConfig.push(buildingLayersTooltipConfig)
    return tooltipsConfig
}

export const CESIUM_LAYER_TOOLTIPS_CONFIGURATION: LayerTooltipConfig[] = createTooltipConfig()
