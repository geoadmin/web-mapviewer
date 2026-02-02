<script setup>
import TileLayer from 'ol/layer/Tile'
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import TileDebug from 'ol/source/TileDebug'
import { computed, inject, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

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

const store = useStore()
const showTileDebugInfo = computed(() => store.state.debug.showTileDebugInfo)

const source = computed(() => {
    const base = {}
    if (geotiffConfig.isLocalFile) {
        base.blob = geotiffConfig.data
    } else {
        base.url = geotiffConfig.fileSource
    }
    return base
})
const opacity = computed(() => parentLayerOpacity ?? geotiffConfig.opacity)

const cogSource = createLayerSource()
const layer = new WebGLTileLayer({
    source: cogSource,
    opacity: opacity.value,
    interpolate: false,  
    // local files do not have an url so we take the blob name
    id: source.value.url ?? source.value.blob?.name,
    uuid: geotiffConfig.uuid,
})

// If we want to have debug tiles for COG, it requires a TileLayer per COG source.
// So it is easier to manage that directly here (where we have access to the source) instead of letting
// OpenLayersTileDebugInfo.vue do it.
const debugSource = new TileDebug({
    source: cogSource,
    color: 'red',
})
const debugLayer = new TileLayer({
    source: debugSource,
})

useAddLayerToMap(layer, olMap, () => zIndex)
const { removeLayerFromMap: removeDebugLayer, addLayerToMap: addDebugLayer } = useAddLayerToMap(
    debugLayer,
    olMap,
    () => zIndex + 1
)
onMounted(() => {
    if (!showTileDebugInfo.value) {
        removeDebugLayer()
    }
})

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(source, () => {
    const newSource = createLayerSource()
    layer.setSource(newSource)
    debugSource.setSource(newSource)
})
watch(showTileDebugInfo, () => {
    if (showTileDebugInfo.value) {
        addDebugLayer()
    } else {
        removeDebugLayer()
    }
})

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
