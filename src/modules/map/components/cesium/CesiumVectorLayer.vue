<script setup>
import { Cesium3DTileset } from 'cesium'
import { computed, inject, toRefs } from 'vue'

import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import useAddPrimitiveLayer from '@/modules/map/components/cesium/utils/useAddPrimitiveLayer.composable'
import log from '@/utils/logging'

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

useAddPrimitiveLayer(getViewer(), loadTileSetAndApplyStyle(url.value))

/**
 * @param {String} tileSetJsonURL
 * @returns {Promise<Cesium3DTileset>}
 */
async function loadTileSetAndApplyStyle(tileSetJsonURL) {
    try {
        return await Cesium3DTileset.fromUrl(tileSetJsonURL)
    } catch (error) {
        log.error('Error while loading tileset for', tileSetJsonURL, error)
    }
}
</script>

<template>
    <slot />
</template>
