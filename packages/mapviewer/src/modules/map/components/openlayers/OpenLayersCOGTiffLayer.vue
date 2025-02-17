<script setup>
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import { computed, inject, watch } from 'vue'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const { geotiffConfig, parentLayerOpacity, zIndex } = defineProps({
    geotiffConfig: {
        type: CloudOptimizedGeoTIFFLayer,
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

const olMap = inject('olMap')
const noDataValue = computed(() => geotiffConfig.noDataValue ?? 0)
const source = computed(() => {
    const base = {
        nodata: noDataValue.value,
    }
    if (geotiffConfig.isLocalFile) {
        base.blob = geotiffConfig.data
    } else {
        base.url = geotiffConfig.fileSource
    }
    return base
})
const opacity = computed(() => parentLayerOpacity ?? geotiffConfig.opacity)

const layer = new WebGLTileLayer({
    source: createLayerSource(),
    opacity: opacity.value,
    id: source.value.url,
})

useAddLayerToMap(layer, olMap, () => zIndex)

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
