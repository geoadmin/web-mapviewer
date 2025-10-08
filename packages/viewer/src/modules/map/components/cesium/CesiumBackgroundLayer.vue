<script setup lang="ts">
import { computed } from 'vue'
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'

import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()

const backgroundLayersFor3D = computed(() => cesiumStore.backgroundLayersFor3D)
const projection = computed(() => positionStore.projection)
</script>

<template>
    <!--
       z-index can be set to zero for all, as only the WMTS
       background layer is an imagery layer (and requires one), all other BG layer are
       primitive layer and will ignore this prop
    -->
    <CesiumInternalLayer
        v-for="(bgLayer, index) in backgroundLayersFor3D"
        :key="bgLayer.id"
        :layer-config="bgLayer"
        :projection="projection"
        :z-index="index"
    />
</template>
