<script setup>
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import { computed, inject, toRefs, watch } from 'vue'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const props = defineProps({
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
const { geotiffConfig, parentLayerOpacity, zIndex } = toRefs(props)

const olMap = inject('olMap')
const noDataValue = computed(() => geotiffConfig.value.noDataValue ?? 0)
const source = computed(() => {
    const base = {
        nodata: noDataValue.value,
    }
    if (geotiffConfig.value.isLocalFile) {
        base.blob = geotiffConfig.value.data
    } else {
        base.url = geotiffConfig.value.fileSource
    }
    return base
})
const opacity = computed(() => parentLayerOpacity.value ?? geotiffConfig.value.opacity)

const layer = new WebGLTileLayer({
    source: createLayerSource(),
    opacity: opacity.value,
})
// we need to set the id, otherwise it would be undefined and we could not work with the layer with some tools
if (!layer.get('id')) {
    layer.set('id', source.value.url)
}
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
