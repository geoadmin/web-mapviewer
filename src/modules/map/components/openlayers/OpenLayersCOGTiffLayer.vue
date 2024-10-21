<script setup>
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import { computed, inject, toRefs, watch } from 'vue'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class.js'
import { COG_FOUR_BAND_COLOR_STYLE_VALUE } from '@/config/map.config'
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
const trueColorStyle = {
    color: [
        'array',
        ['/', ['band', 1], COG_FOUR_BAND_COLOR_STYLE_VALUE],
        ['/', ['band', 2], COG_FOUR_BAND_COLOR_STYLE_VALUE],
        ['/', ['band', 3], COG_FOUR_BAND_COLOR_STYLE_VALUE],
        1,
    ],
}

const olMap = inject('olMap')
const noDataValue = computed(() => geotiffConfig.value.noDataValue ?? 0)
const isMoreThanThreeBand = computed(() => geotiffConfig.value.isMoreThanThreeBand)
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
setLayerStyleAccordingToBandCount()
useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch([source, isMoreThanThreeBand], () => {
    layer.setSource(createLayerSource())
    setLayerStyleAccordingToBandCount()
})

function setLayerStyleAccordingToBandCount() {
    layer.setStyle({})
    if (isMoreThanThreeBand.value) {
        layer.setStyle(trueColorStyle)
    }
}

function createLayerSource() {
    return new GeoTIFFSource({
        convertToRGB: 'auto',
        normalize: !isMoreThanThreeBand.value,
        sources: [source.value],
    })
}
</script>

<template>
    <slot />
</template>
