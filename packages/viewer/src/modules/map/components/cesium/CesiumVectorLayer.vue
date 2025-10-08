<script setup lang="ts">
import type { GeoAdmin3DLayer } from '@swissgeo/layers'
import { Cesium3DTileset, type Viewer } from 'cesium'
import { computed, inject, toRef } from 'vue'

import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'

const { layerConfig } = defineProps<{ layerConfig: GeoAdmin3DLayer }>()

const getViewer = inject<() => Viewer | undefined>('getViewer')

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

useAddPrimitiveLayer(getViewer?.(), Cesium3DTileset.fromUrl(url.value), toRef(opacity), {
    withEnhancedLabelStyle: layerId.value === 'ch.swisstopo.swissnames3d.3d',
})
</script>

<template>
    <slot />
</template>
