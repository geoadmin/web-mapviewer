<script setup>
import { computed, inject, onBeforeUnmount, onMounted, toRefs } from 'vue'

import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import { loadTileSetAndApplyStyle } from '@/modules/map/components/cesium/utils/primitiveLayerUtils'

const props = defineProps({
    layerConfig: {
        type: GeoAdmin3DLayer,
        required: true,
    },
})
const { layerConfig } = toRefs(props)

const getViewer = inject('getViewer')

const baseUrl = computed(() => layerConfig.value.baseUrl)
const layerId = computed(() => layerConfig.value.id)

const url = computed(() => {
    let rootFolder = ''
    if (layerConfig.value.use3dTileSubFolder) {
        rootFolder = '3d-tiles/'
    }
    let timeFolder = ''
    if (layerConfig.value.urlTimestampToUse) {
        timeFolder = `/${layerConfig.value.urlTimestampToUse}`
    }
    return `${baseUrl.value}${rootFolder}${layerId.value}${timeFolder}/tileset.json`
})

let layer

onMounted(async () => {
    layer = getViewer().scene.primitives.add(
        await loadTileSetAndApplyStyle(url.value, {
            withEnhancedLabelStyle: layerId.value === 'ch.swisstopo.swissnames3d.3d',
        })
    )
})
onBeforeUnmount(() => {
    const viewer = getViewer()
    layer.show = false
    viewer.scene.primitives.remove(layer)
    viewer.scene.requestRender()
})
</script>

<template>
    <slot />
</template>
