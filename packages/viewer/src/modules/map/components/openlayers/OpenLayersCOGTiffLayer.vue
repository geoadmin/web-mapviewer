<script setup lang="ts">
import type { Map } from 'ol'
import type { CloudOptimizedGeoTIFFLayer } from '@swissgeo/layers'

import TileLayer from 'ol/layer/Tile'
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource from 'ol/source/GeoTIFF'
import TileDebug from 'ol/source/TileDebug'
import { computed, inject, onMounted, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useDebugStore from '@/store/modules/debug.store'

interface Props {
    geotiffConfig: CloudOptimizedGeoTIFFLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

const olMap = inject<Map>('olMap')!

const debugStore = useDebugStore()
const showTileDebugInfo = computed(() => debugStore.showTileDebugInfo)

const source = computed(() => {
    const base: { blob?: Blob; url?: string } = {}
    if (props.geotiffConfig.isLocalFile) {
        const data = props.geotiffConfig.data
        if (data instanceof Blob) {
            base.blob = data
        }
    } else {
        base.url = props.geotiffConfig.fileSource
    }
    return base
})
const opacity = computed(() => props.parentLayerOpacity ?? props.geotiffConfig.opacity)

const cogSource = createLayerSource()
const layer = new WebGLTileLayer({
    source: cogSource,
    opacity: opacity.value,
    properties: {
        // local files do not have an url so we take the blob name if it's a File
        id: source.value.url ?? (source.value.blob instanceof File ? source.value.blob.name : 'local-geotiff'),
        uuid: props.geotiffConfig.uuid,
    },
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

useAddLayerToMap(layer, olMap, props.zIndex)
const { removeLayerFromMap: removeDebugLayer, addLayerToMap: addDebugLayer } = useAddLayerToMap(
    debugLayer,
    olMap,
    props.zIndex + 1
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
    // TileDebug doesn't have setSource, so we need to create a new debug source
    const newDebugSource = new TileDebug({
        source: newSource,
        color: 'red',
    })
    debugLayer.setSource(newDebugSource)
})
watch(showTileDebugInfo, () => {
    if (showTileDebugInfo.value) {
        addDebugLayer()
    } else {
        removeDebugLayer()
    }
})

function createLayerSource(): GeoTIFFSource {
    return new GeoTIFFSource({
        convertToRGB: 'auto',
        sources: [source.value],
    })
}
</script>

<template>
    <slot />
</template>
