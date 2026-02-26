import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import { get3dTilesBaseUrl } from '@swissgeo/staging-config'
import {
    CESIUM_BUILDING_LAYER_ID,
    CESIUM_CONSTRUCTIONS_LAYER_ID,
    CESIUM_LABELS_LAYER_ID,
    CESIUM_VEGETATION_LAYER_ID,
} from '@swissgeo/staging-config/constants'

import type { CesiumStore } from '@/store/modules/cesium/types'

import useLayersStore from '@/store/modules/layers'

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

export default function backgroundLayersFor3D(this: CesiumStore): Layer[] {
    const layerStore = useLayersStore()

    const bgLayers: Layer[] = []
    const backgroundLayer = layerStore.currentBackgroundLayer
    if (backgroundLayer) {
        if ('idIn3d' in backgroundLayer && backgroundLayer.idIn3d !== undefined) {
            const matchingBackgroundIn3D = layerStore.config.find(
                (layer) => layer.id === backgroundLayer.idIn3d
            )
            if (matchingBackgroundIn3D) {
                bgLayers.push(matchingBackgroundIn3D as Layer)
            } else {
                bgLayers.push(backgroundLayer)
            }
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
}
