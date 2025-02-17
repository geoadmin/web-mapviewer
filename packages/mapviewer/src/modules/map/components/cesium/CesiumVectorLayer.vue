<script setup>
import { Cesium3DTileset } from 'cesium'
import { computed, inject, toRef } from 'vue'

import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'

const { layerConfig } = defineProps({
    layerConfig: {
        type: GeoAdmin3DLayer,
        required: true,
    },
})

const getViewer = inject('getViewer')

const baseUrl = computed(() => layerConfig.baseUrl)
const layerId = computed(() => layerConfig.id)
const opacity = computed(() => layerConfig.opacity)

const url = computed(() => {
    let rootFolder = ''
    if (layerConfig.use3dTileSubFolder) {
        rootFolder = '3d-tiles/'
    }
    let timeFolder = ''
    if (layerConfig.urlTimestampToUse) {
        timeFolder = `/${layerConfig.urlTimestampToUse}`
    }
    return `${baseUrl.value}${rootFolder}${layerId.value}${timeFolder}/tileset.json`
})

useAddPrimitiveLayer(getViewer(), Cesium3DTileset.fromUrl(url.value), toRef(opacity), {
    withEnhancedLabelStyle: layerId.value === 'ch.swisstopo.swissnames3d.3d',
})
</script>

<template>
    <slot />
</template>
