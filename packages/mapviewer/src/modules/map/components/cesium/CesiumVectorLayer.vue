<script setup>
import { Cesium3DTileset } from 'cesium'
import { computed, inject } from 'vue'

import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import { CESIUM_BUILDING_LAYER_ID } from '@/config/cesium.config'
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

useAddPrimitiveLayer(
    getViewer(),
    Cesium3DTileset.fromUrl(url.value, {
        // with default value 16 we do not load a lot of building tiles (leading to gaps)
        maximumScreenSpaceError: layerId.value === CESIUM_BUILDING_LAYER_ID ? 10 : 16,
        cacheBytes: layerId.value === CESIUM_BUILDING_LAYER_ID ? 256 * 1024 ** 2 : undefined,
        maximumCacheOverflowBytes:
            layerId.value === CESIUM_BUILDING_LAYER_ID ? 128 * 1024 ** 2 : undefined,
    }),
    opacity
)
</script>

<template>
    <slot />
</template>
