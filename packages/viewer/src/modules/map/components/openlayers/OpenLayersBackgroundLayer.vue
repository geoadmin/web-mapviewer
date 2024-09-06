<script setup lang="js">
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'

const store = useStore()
const currentBackgroundLayer = computed(() => store.getters.currentBackgroundLayer)
const layersConfig = computed(() => store.state.layers.config)
const vectorTileCounterpart = computed(() =>
    layersConfig.value.find((layer) => layer.id === currentBackgroundLayer.value.idInVectorTile)
)

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-if="currentBackgroundLayer"
        :layer-config="vectorTileCounterpart ?? currentBackgroundLayer"
        :z-index="getZIndexForLayer(currentBackgroundLayer)"
    />
</template>
