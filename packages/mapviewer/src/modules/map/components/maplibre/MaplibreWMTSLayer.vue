<script setup>
import { LV95, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { computed, onMounted, toRef } from 'vue'

import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddRasterLayer from '@/modules/map/components/maplibre/utils/useAddRasterLayer.composable'
import { getWmtsXyzUrl } from '@/utils/layerUtils'

const { wmtsLayerConfig, previousLayerId } = defineProps({
    wmtsLayerConfig: {
        type: [GeoAdminWMTSLayer, ExternalWMTSLayer],
        required: true,
    },
    previousLayerId: {
        type: String,
        default: null,
    },
})

const sourceId = computed(() => `source-${wmtsLayerConfig.id}`)
const layerSource = computed(() => ({
    type: 'raster',
    tiles: [
        getWmtsXyzUrl(wmtsLayerConfig, WEBMERCATOR, {
            addTimestamp: true,
        }),
    ],
    bounds: LV95.getBoundsAs(WGS84).flatten,
    tileSize: 256,
}))
const layer = computed(() => ({
    id: wmtsLayerConfig.id,
    type: 'raster',
    source: sourceId.value,
}))
const opacity = computed(() => wmtsLayerConfig.opacity)

onMounted(() => {
    useAddRasterLayer(
        toRef(layer),
        toRef(sourceId),
        toRef(layerSource),
        toRef(opacity),
        toRef(() => previousLayerId)
    )
})
</script>

<template>
    <slot />
</template>
