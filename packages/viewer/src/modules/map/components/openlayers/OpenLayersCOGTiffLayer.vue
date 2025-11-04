<script setup lang="ts">
import type { CloudOptimizedGeoTIFFLayer } from '@swissgeo/layers'
import type Map from 'ol/Map'

import log from '@swissgeo/log'
import TileLayer from 'ol/layer/Tile'
import WebGLTileLayer from 'ol/layer/WebGLTile'
import GeoTIFFSource, { type SourceInfo } from 'ol/source/GeoTIFF'
import TileDebug from 'ol/source/TileDebug'
import { computed, inject, onMounted, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useDebugStore from '@/store/modules/debug'

const {
    geotiffConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    geotiffConfig: CloudOptimizedGeoTIFFLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

const debugStore = useDebugStore()
const showTileDebugInfo = computed<boolean>(() => debugStore.showTileDebugInfo)

const source = computed<SourceInfo>(() => {
    const base: SourceInfo = {}
    if (geotiffConfig.isLocalFile) {
        const data = geotiffConfig.data
        if (typeof data === 'string') {
            base.blob = new Blob([data])
        } else if (data instanceof Blob) {
            base.blob = data
        }
    } else {
        base.url = geotiffConfig.fileSource
    }
    return base
})
const opacity = computed<number>(() => parentLayerOpacity ?? geotiffConfig.opacity)

const cogSource = createLayerSource()
const layer = new WebGLTileLayer({
    properties: {
        interpolate: false,
        id: source.value.url ?? geotiffConfig.uuid,
        uuid: geotiffConfig.uuid,
    },
    source: cogSource,
    opacity: opacity.value,
})

// If we want to have debug tiles for COG, it requires a TileLayer per COG source.
// So it is easier to manage that directly here (where we have access to the source) instead of letting
// OpenLayersTileDebugInfo.vue do it.
const debugLayer = new TileLayer({
    source: createTileDebugSource(cogSource),
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
    debugLayer.setSource(createTileDebugSource(newSource))
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
        interpolate: false,
    })
}

function createTileDebugSource(cogSource: GeoTIFFSource): TileDebug {
    return new TileDebug({
        source: cogSource,
        color: 'red',
    })
}
</script>

<template>
    <slot />
</template>
