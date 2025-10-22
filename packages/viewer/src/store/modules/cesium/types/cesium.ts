import type { Layer } from '@swissgeo/layers'

import type { LayerTooltipConfig } from '@/config/cesium.config'

/** Store for all information related to the 3D viewer */
export interface CesiumStoreState {
    /** Flag telling if the app should be displaying the map in 3D or not */
    active: boolean
    /**
     * Flag telling if the 3D viewer should show the vegetation layer (ch.swisstopo.vegetation.3d)
     *
     * The vegetation layer needs to be updated to work optimally with the latest version of Cesium.
     * While waiting for this update to be available, we disable the vegetation layer by default (it
     * can be activated through the debug tools on the side of the map)
     */
    showVegetation: boolean
    /**
     * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlbuildings3d.3d). As
     * this layer has already been updated for the latest Cesium stack, we activate it by default.
     */
    showBuildings: boolean
    /**
     * Flag telling if the 3D viewer should show buildings (ch.swisstopo.swisstlm3d.3d). As this
     * layer has already been updated for the latest Cesium stack, we activate it by default.
     */
    showConstructions: boolean
    /** Flag telling if the 3D viewer should show the labels () */
    showLabels: boolean
    /** Flag telling if the 3D viewer is ready or not */
    isViewerReady: boolean
    /**
     * An array of Cesium Layer tooltip configurations, stating which Cesium layers have tooltips,
     * and what should be shown to the user
     */
    layersTooltipConfig: LayerTooltipConfig[]
}

export interface CesiumStoreGetters {
    backgroundLayersFor3D(): Layer[]
    layersWithTooltips(): Layer[]
}

export type CesiumStore = ReturnType<typeof import('../index.ts').default>
