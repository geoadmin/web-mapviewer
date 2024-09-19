<script setup>
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import { computed, inject, toRefs } from 'vue'

import GeoTIFFLayer from '@/api/layers/GeoTIFFLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const props = defineProps({
    geotiffConfig: {
        type: GeoTIFFLayer,
        required: true,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { geotiffConfig, zIndex } = toRefs(props)

const olMap = inject('olMap')
const source = computed(() => {
    if (geotiffConfig.value.isLocalFile) {
        return { blob: geotiffConfig.value.data }
    }
    return { url: geotiffConfig.value.fileSource }
})

const geoTIFFSource = new GeoTIFFSource({
    convertToRGB: 'auto',
    sources: [source.value],
})
const layer = new WebGLTileLayer({
    source: geoTIFFSource,
})
useAddLayerToMap(layer, olMap, zIndex)
</script>

<template>
    <slot />
</template>
