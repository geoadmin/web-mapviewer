<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const store = useStore()
const backgroundLayersFor3D = computed(() => store.getters.backgroundLayersFor3D)
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)
const visibleLayers = computed(() => store.getters.visibleLayers)

const visibleImageryLayers = computed(() =>
    visibleLayers.value.filter((l) =>
        [LayerTypes.WMS, LayerTypes.WMTS, LayerTypes.AGGREGATE, LayerTypes.GROUP].includes(l.type)
    )
)
const visiblePrimitiveLayers = computed(() =>
    visibleLayers.value.filter((l) =>
        [LayerTypes.GPX, LayerTypes.KML, LayerTypes.GEOJSON].includes(l.type)
    )
)
const startingZIndexForImageryLayers = computed(() =>
    backgroundLayersFor3D.value.some((layer) => layer.type === LayerTypes.WMTS) ? 1 : 0
)
</script>

<template>
    <!--
   Only imagery layers require a z-index, we start to count them at 1 because of the
   background WMTS layer
-->
    <CesiumInternalLayer
        v-for="(layer, index) in visibleImageryLayers"
        :key="layer.id"
        :layer-config="layer"
        :preview-year="previewYear"
        :projection="projection"
        :z-index="index + startingZIndexForImageryLayers"
    />

    <CesiumInternalLayer
        v-for="layer in visiblePrimitiveLayers"
        :key="layer.id"
        :layer-config="layer"
        :preview-year="previewYear"
        :projection="projection"
    />
</template>