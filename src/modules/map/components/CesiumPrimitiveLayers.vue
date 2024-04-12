<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const store = useStore()
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)
const visibleLayers = computed(() => store.getters.visibleLayers)

const visiblePrimitiveLayers = computed(() =>
    visibleLayers.value.filter((l) => l instanceof GeoAdminGeoJsonLayer || l instanceof KMLLayer)
)
</script>

<template>
    <CesiumInternalLayer
        v-for="layer in visiblePrimitiveLayers"
        :key="layer.id"
        :layer-config="layer"
        :preview-year="previewYear"
        :projection="projection"
    />
</template>