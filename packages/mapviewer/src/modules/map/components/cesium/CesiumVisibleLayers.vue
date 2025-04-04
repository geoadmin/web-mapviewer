<script setup>
import { LayerType } from '@geoadmin/layers'
import { cloneDeep } from 'lodash'
import { computed } from 'vue'
import { useStore } from 'vuex'

import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const store = useStore()

const visibleLayers = computed(() => store.getters.visibleLayers)
const layersConfig = computed(() => store.state.layers.config)
const projection = computed(() => store.state.position.projection)
const backgroundLayersFor3D = computed(() => store.getters.backgroundLayersFor3D)

const visibleImageryLayers = computed(() =>
    visibleLayers.value.filter(isImageryLayer).map((imageryLayer) => {
        if (imageryLayer.idIn3d) {
            // in order to have the correct opacity, we need to clone the 3D config and give it the 2D opacity
            // (we can't just modify the 3D config without cloning it, as it comes directly from the store)
            let configIn3d = layersConfig.value.find((layer) => layer.id === imageryLayer.idIn3d)
            if (configIn3d) {
                configIn3d = cloneDeep(configIn3d)
                configIn3d.opacity = imageryLayer.opacity
                return configIn3d
            }
        }
        return imageryLayer
    })
)
const visiblePrimitiveLayers = computed(() => visibleLayers.value.filter(isPrimitiveLayer))

const startingZIndexForImageryLayers = computed(
    () => backgroundLayersFor3D.value.filter(isImageryLayer).length
)

function isImageryLayer(layer) {
    return (
        [LayerType.WMTS, LayerType.WMS, LayerType.AGGREGATE].includes(layer.type) ||
        (layer.isExternal && !LayerType.KML && !LayerType.GPX && !LayerType.GEOJSON)
    )
}

function isPrimitiveLayer(layer) {
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
