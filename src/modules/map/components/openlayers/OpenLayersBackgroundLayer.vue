<script setup>
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const currentBackgroundLayer = computed(() => store.state.layers.currentBackgroundLayer)

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-if="currentBackgroundLayer"
        :layer-config="currentBackgroundLayer"
        :z-index="getZIndexForLayer(currentBackgroundLayer)"
    />
</template>
