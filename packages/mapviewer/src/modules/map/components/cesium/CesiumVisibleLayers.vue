<script setup lang="ts">
import type { GeoAdminLayer, Layer } from '@swissgeo/layers'

import { computed } from 'vue'

import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'
import useCesiumStore from '@/store/modules/cesium'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

const layersStore = useLayersStore()
const positionStore = usePositionStore()
const cesiumStore = useCesiumStore()

const visibleImageryLayers = computed<Layer[]>(
    () =>
        layersStore.visibleLayers.filter(isImageryLayer).map((imageryLayer) => {
            // If this layer has a 3D counterpart, try to map to the 3D config while keeping the 2D opacity
            // idIn3d only exists on GeoAdmin layers
            const withIdIn3d = imageryLayer as Partial<GeoAdminLayer>
            if (withIdIn3d.idIn3d) {
                const configIn3d = layersStore.config.find(
                    (layer) => layer.id === withIdIn3d.idIn3d
                )
                if (configIn3d) {
                    return { ...configIn3d, opacity: imageryLayer.opacity }
                }
            }
            return imageryLayer
        }) as Layer[]
)
const visiblePrimitiveLayers = computed<Layer[]>(() =>
    layersStore.visibleLayers.filter(isPrimitiveLayer)
)

const startingZIndexForImageryLayers = computed(
    () => cesiumStore.backgroundLayersFor3D.filter(isImageryLayer).length
)

function isImageryLayer(layer: Layer): boolean {
    return ['WMTS', 'WMS', 'AGGREGATE'].includes(layer.type)
}

function isPrimitiveLayer(layer: Layer): boolean {
    return ['GEOJSON', 'KML', 'GPX'].includes(layer.type)
}
</script>

<template>
    <!--
   Layers split between imagery and primitive type for correct zIndex ordering.
   Only imagery layers require a z-index, we start to count them at 1 or 0 depending on the
   background WMTS layer
-->
    <CesiumInternalLayer
        v-for="(layer, index) in visibleImageryLayers"
        :key="layer.id + layer.uuid"
        :layer-config="layer"
        :projection="positionStore.projection"
        :z-index="index + startingZIndexForImageryLayers"
    />
    <CesiumInternalLayer
        v-for="layer in visiblePrimitiveLayers"
        :key="layer.id + layer.uuid"
        :layer-config="layer"
        :projection="positionStore.projection"
    />
</template>
