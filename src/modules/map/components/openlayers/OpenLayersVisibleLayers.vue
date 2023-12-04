<script setup>
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const visibleLayers = computed(() => store.getters.visibleLayers)

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-for="layer in visibleLayers"
        :key="layer.getID()"
        :layer-config="layer"
        :z-index="getZIndexForLayer(layer)"
    />
</template>
