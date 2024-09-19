<script setup>
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import { computed, inject, toRefs, watch } from 'vue'

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
const { geotiffConfig, parentLayerOpacity, zIndex } = toRefs(props)

const olMap = inject('olMap')
const source = computed(() => {
    if (geotiffConfig.value.isLocalFile) {
        return { blob: geotiffConfig.value.data }
    }
    return { url: geotiffConfig.value.fileSource }
})
const opacity = computed(() => parentLayerOpacity.value ?? geotiffConfig.value.opacity)

const layer = new WebGLTileLayer({
    source: createLayerSource(),
    opacity: opacity.value,
})
useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(source, () => layer.setSource(createLayerSource()))

function createLayerSource() {
    return new GeoTIFFSource({
        convertToRGB: 'auto',
        sources: [source.value],
    })
}
</script>

<template>
    <slot />
</template>
