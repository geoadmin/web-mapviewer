<script setup lang="ts">
import type { GeoAdmin3DLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import { Cesium3DTileset, type Viewer } from 'cesium'
import { computed, inject, toRef } from 'vue'

import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'

const { layerConfig } = defineProps<{ layerConfig: GeoAdmin3DLayer }>()
const viewer = inject<{ instance: Viewer | undefined }>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumVectorLayer.vue',
        message: ['Viewer not initialized, cannot create vector layer'],
    })
    throw new Error('Viewer not initialized, cannot create vector layer')
}

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
    viewer.instance,
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
