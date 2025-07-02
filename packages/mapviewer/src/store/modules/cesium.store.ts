import type { Layer } from '@geoadmin/layers'

import { layerUtils } from '@geoadmin/layers/utils'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/store'

import { get3dTilesBaseUrl } from '@/config/baseUrl.config'
import {
    CESIUM_BUILDING_LAYER_ID,
    CESIUM_CONSTRUCTIONS_LAYER_ID,
    CESIUM_LABELS_LAYER_ID,
    CESIUM_LAYER_TOOLTIPS_CONFIGURATION,
    CESIUM_VEGETATION_LAYER_ID,
    type LayerTooltipConfig,
} from '@/config/cesium.config'
import useLayersStore from '@/store/modules/layers.store'

const labelLayer = layerUtils.makeGeoAdmin3DLayer({
    id: CESIUM_LABELS_LAYER_ID,
    name: '3d_labels',
    urlTimestampToUse: '20180716',
    use3dTileSubFolder: true,
    baseUrl: get3dTilesBaseUrl(),
})
const vegetationLayer = layerUtils.makeGeoAdmin3DLayer({
    id: CESIUM_VEGETATION_LAYER_ID,
    name: '3d_vegetation',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false,
    baseUrl: get3dTilesBaseUrl(),
})
const buildingsLayer = layerUtils.makeGeoAdmin3DLayer({
    id: CESIUM_BUILDING_LAYER_ID,
    name: '3d_constructions',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false, // buildings JSON has already been migrated to the new URL nomenclature
    baseUrl: get3dTilesBaseUrl(),
})
const constructionsLayer = layerUtils.makeGeoAdmin3DLayer({
    id: CESIUM_CONSTRUCTIONS_LAYER_ID,
    name: '3d_constructions',
    urlTimestampToUse: 'v1',
    use3dTileSubFolder: false, // buildings JSON has already been migrated to the new URL nomenclature
    baseUrl: get3dTilesBaseUrl(),
})

/** Module that stores all information related to the 3D viewer */
export interface CesiumState {
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

const useCesiumStore = defineStore('cesium', {
    state: (): CesiumState => ({
        active: false,
        showVegetation: false,
        showBuildings: true,
        showConstructions: true,
        showLabels: true,
        isViewerReady: false,
        layersTooltipConfig: CESIUM_LAYER_TOOLTIPS_CONFIGURATION,
    }),
    getters: {
        backgroundLayersFor3D(): Layer[] {
            const layerStore = useLayersStore()

            const bgLayers = []
            const backgroundLayer = layerStore.currentBackgroundLayer
            if (backgroundLayer) {
                if ('idIn3d' in backgroundLayer && backgroundLayer.idIn3d !== undefined) {
                    const matchingBackgroundIn3D = layerStore.config.find(
                        (layer) => layer.id === backgroundLayer.idIn3d
                    )
                    bgLayers.push(matchingBackgroundIn3D ?? backgroundLayer)
                } else {
                    bgLayers.push(backgroundLayer)
                }
            }
            if (this.showLabels) {
                // labels are not up-to-date with the latest Cesium version, but we need then anyway ¯\_(ツ)_/¯
                bgLayers.push(labelLayer)
            }
            if (this.showBuildings) {
                bgLayers.push(buildingsLayer)
            }
            if (this.showConstructions) {
                bgLayers.push(constructionsLayer)
            }
            if (this.showVegetation) {
                bgLayers.push(vegetationLayer)
            }
            return bgLayers
        },

        layersWithTooltips(): Layer[] {
            return this.backgroundLayersFor3D.filter((bgLayer) =>
                this.layersTooltipConfig
                    .map((layerConfig) => layerConfig.layerId)
                    .includes(bgLayer.id)
            )
        },
    },
    actions: {
        set3dActive(active: boolean, dispatcher: ActionDispatcher) {
            this.active = active
        },

        setShowConstructionsBuildings(show: boolean, dispatcher: ActionDispatcher) {
            this.showConstructions = show
            this.showBuildings = show
        },

        setShowVegetation(show: boolean, dispatcher: ActionDispatcher) {
            this.showVegetation = show
        },

        setShowLabels(show: boolean, dispatcher: ActionDispatcher) {
            this.showLabels = show
        },

        setViewerReady(isReady: boolean, dispatcher: ActionDispatcher) {
            this.isViewerReady = isReady
        },
    },
})

export default useCesiumStore
