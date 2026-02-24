<script setup lang="ts">
import { computed } from 'vue'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'
import useLayersStore from '@/store/modules/layers'

const layersStore = useLayersStore()
const currentBackgroundLayer = computed(() => layersStore.currentBackgroundLayer)

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-if="currentBackgroundLayer"
        :layer-config="currentBackgroundLayer"
        :z-index="getZIndexForLayer(currentBackgroundLayer)"
    />
</template>
