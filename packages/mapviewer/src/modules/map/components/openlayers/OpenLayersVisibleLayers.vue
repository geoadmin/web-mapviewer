<script setup lang="ts">
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'
import useLayersStore from '@/store/modules/layers'

const layersStore = useLayersStore()

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-for="layer in layersStore.visibleLayers"
        :key="layer.id + layer.uuid"
        :layer-config="layer"
        :z-index="getZIndexForLayer(layer)"
    />
</template>
