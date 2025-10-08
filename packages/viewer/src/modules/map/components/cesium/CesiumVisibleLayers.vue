<script setup lang="ts">
import { computed } from 'vue'
import { LayerType, type GeoAdminLayer, type Layer } from '@swissgeo/layers'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import useCesiumStore from '@/store/modules/cesium.store'
import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const layersStore = useLayersStore()
const positionStore = usePositionStore()
const cesiumStore = useCesiumStore()

const visibleLayers = computed(() => layersStore.visibleLayers)
const layersConfig = computed(() => layersStore.config)
const projection = computed(() => positionStore.projection)
const backgroundLayersFor3D = computed(() => cesiumStore.backgroundLayersFor3D)

const visibleImageryLayers = computed<Layer[]>(() =>
    visibleLayers.value.filter(isImageryLayer).map((imageryLayer) => {
        // If this layer has a 3D counterpart, try to map to the 3D config while keeping the 2D opacity
        // idIn3d only exists on GeoAdmin layers
        const withIdIn3d = imageryLayer as Partial<GeoAdminLayer>
        if (withIdIn3d.idIn3d) {
            const configIn3d = layersConfig.value.find(
                (layer: GeoAdminLayer) => layer.id === withIdIn3d.idIn3d
            )
            if (configIn3d) {
                return { ...configIn3d, opacity: imageryLayer.opacity }
            }
        }
        return imageryLayer
    })
)
const visiblePrimitiveLayers = computed<Layer[]>(() => visibleLayers.value.filter(isPrimitiveLayer))

const startingZIndexForImageryLayers = computed(
    () => backgroundLayersFor3D.value.filter(isImageryLayer).length
)

function isImageryLayer(layer: Layer): boolean {
    return [LayerType.WMTS, LayerType.WMS, LayerType.AGGREGATE].includes(layer.type)
}

function isPrimitiveLayer(layer: Layer): boolean {
    return [LayerType.GEOJSON, LayerType.KML, LayerType.GPX].includes(layer.type)
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
        :projection="projection"
        :z-index="index + startingZIndexForImageryLayers"
    />
    <CesiumInternalLayer
        v-for="layer in visiblePrimitiveLayers"
        :key="layer.id + layer.uuid"
        :layer-config="layer"
        :projection="projection"
    />
</template>
