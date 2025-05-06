<script setup>
import { LV95, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { computed, onMounted, toRef } from 'vue'
import { useStore } from 'vuex'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import useAddRasterLayer from '@/modules/map/components/maplibre/utils/useAddRasterLayer.composable'

const { wmsLayerConfig, previousLayerId } = defineProps({
    wmsLayerConfig: {
        type: [GeoAdminWMSLayer, ExternalWMSLayer],
        required: true,
    },
    previousLayerId: {
        type: String,
        default: null,
    },
})

const store = useStore()
const currentLang = computed(() => store.state.i18n.lang)

const baseUrl = computed(() => {
    let url = getBaseUrlOverride('wms') ?? wmsLayerConfig.baseUrl
    if (!url.endsWith('?')) {
        url = `${url}?`
    }
    const params = {
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetMap',
        LAYERS: wmsLayerConfig.technicalName ?? wmsLayerConfig.id,
        FORMAT: `image/${wmsLayerConfig.format ?? 'png'}`,
        LANG: currentLang.value,
    }
    return `${url}${Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
})

const tileSize = 256
const sourceId = computed(() => `source-${wmsLayerConfig.id}`)
const layerSource = computed(() => ({
    type: 'raster',
    tiles: [
        `${baseUrl.value}&WIDTH=${tileSize}&HEIGHT=${tileSize}&BBOX={bbox-epsg-3857}&CRS=${WEBMERCATOR.epsg}`,
    ],
    tileSize: tileSize,
    bounds: LV95.getBoundsAs(WGS84).flatten,
}))
const layer = computed(() => ({
    id: wmsLayerConfig.id,
    type: 'raster',
    source: sourceId.value,
}))
const opacity = computed(() => wmsLayerConfig.opacity)

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
