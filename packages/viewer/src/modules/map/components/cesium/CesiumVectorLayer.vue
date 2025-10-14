<script setup lang="ts">
import type { GeoAdmin3DLayer } from '@swissgeo/layers'
import { Cesium3DTileset } from 'cesium'
import { computed, toRef } from 'vue'

import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'
import { getCesiumViewer } from '@/modules/map/components/cesium/utils/viewerUtils'

const { layerConfig } = defineProps<{ layerConfig: GeoAdmin3DLayer }>()

const url = computed(() => {
    let rootFolder = ''
    if (layerConfig.use3dTileSubFolder) {
        rootFolder = '3d-tiles/'
    }
    let timeFolder = ''
    if (layerConfig.urlTimestampToUse) {
        timeFolder = `/${layerConfig.urlTimestampToUse}`
    }
    return `${layerConfig.baseUrl}${rootFolder}${layerConfig.id}${timeFolder}/tileset.json`
})

useAddPrimitiveLayer(
    getCesiumViewer(),
    Cesium3DTileset.fromUrl(url.value),
    toRef(layerConfig.opacity),
    {
        withEnhancedLabelStyle: layerConfig.id === 'ch.swisstopo.swissnames3d.3d',
    }
)
</script>

<template>
    <slot />
</template>
