<script setup lang="ts">
import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'
import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'

const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()
</script>

<template>
    <!--
       z-index can be set to zero for all, as only the WMTS
       background layer is an imagery layer (and requires one), all other BG layer are
       primitive layer and will ignore this prop
    -->
    <CesiumInternalLayer
        v-for="(bgLayer, index) in cesiumStore.backgroundLayersFor3D"
        :key="bgLayer.id"
        :layer-config="bgLayer"
        :projection="positionStore.projection"
        :z-index="index"
    />
</template>
