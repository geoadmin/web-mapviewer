<script setup>
import { LayerType } from '@geoadmin/layers'
import { Cesium3DTileset } from 'cesium'
import { computed, inject, toRef } from 'vue'

import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'

const { layerConfig } = defineProps({
    layerConfig: {
        // actually this expects a 3d layer, but we can't represent that with the current
        // typing of the layers
        validator: (value) => value.type === LayerType.VECTOR,
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
