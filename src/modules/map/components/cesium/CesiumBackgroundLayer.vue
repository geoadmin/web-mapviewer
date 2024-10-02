<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'

const store = useStore()

const backgroundLayersFor3D = computed(() => store.getters.backgroundLayersFor3D)
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
        :z-index="index"
    />
</template>
