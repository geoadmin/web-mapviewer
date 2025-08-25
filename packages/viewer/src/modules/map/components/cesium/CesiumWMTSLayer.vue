<script setup>
import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import { Rectangle, UrlTemplateImageryProvider, WebMapTileServiceImageryProvider } from 'cesium'
import { computed, inject, onBeforeUnmount, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer, { WMTSEncodingTypes } from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import { getWmtsXyzUrl } from '@/utils/layerUtils'

const dispatcher = { dispatcher: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18
const unsupportedProjectionError = new ErrorMessage('3d_unsupported_projection')

const { wmtsLayerConfig, zIndex, parentLayerOpacity } = defineProps({
    wmtsLayerConfig: {
        type: [GeoAdminWMTSLayer, ExternalWMTSLayer],
        required: true,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
})

const getViewer = inject('getViewer')

const store = useStore()
const projection = computed(() => store.state.position.projection)
const opacity = computed(() => parentLayerOpacity ?? wmtsLayerConfig.opacity ?? 1.0)
const currentYear = computed(() => wmtsLayerConfig.timeConfig?.currentYear)

const url = computed(() =>
    getWmtsXyzUrl(wmtsLayerConfig, projection.value, {
        addTimestamp: true,
    })
)
const tileMatrixSet = computed(() => {
    if (!wmtsLayerConfig.tileMatrixSets) {
        return null
    }
    if (
        !wmtsLayerConfig.tileMatrixSets.some((set) => set.projection.epsg === projection.value.epsg)
    ) {
        log.error(`External layer ${wmtsLayerConfig.id} does not support ${projection.value.epsg}`)
        store.dispatch('addLayerError', {
            layerId: wmtsLayerConfig.id,
            isExternal: wmtsLayerConfig.isExternal,
            baseUrl: wmtsLayerConfig.baseUrl,
            error: unsupportedProjectionError,
            ...dispatcher,
        })
    }
    return wmtsLayerConfig.tileMatrixSets
})
const tileMatrixSetId = computed(() => tileMatrixSet.value?.id ?? projection.value.epsg)
const tileMatrixLabels = computed(() => wmtsLayerConfig?.options?.tileGrid?.getMatrixIds())

watch(currentYear, () => {
    refreshLayer()
})

onBeforeUnmount(() => {
    if (wmtsLayerConfig.containErrorMessage(unsupportedProjectionError)) {
        store.dispatch('removeLayerError', {
            layerId: wmtsLayerConfig.id,
            isExternal: wmtsLayerConfig.isExternal,
            baseUrl: wmtsLayerConfig.baseUrl,
            error: unsupportedProjectionError,
            ...dispatcher,
        })
    }
})

function createProvider() {
    let provider
    if (wmtsLayerConfig instanceof ExternalWMTSLayer && tileMatrixSetId.value) {
        provider = new WebMapTileServiceImageryProvider({
            url:
                wmtsLayerConfig.getTileEncoding === WMTSEncodingTypes.KVP
                    ? wmtsLayerConfig.baseUrl
                    : wmtsLayerConfig.urlTemplate,
            layer: wmtsLayerConfig.id,
            style: wmtsLayerConfig.style,
            tileMatrixSetID: tileMatrixSetId.value,
            tileMatrixLabels: tileMatrixLabels.value,
        })
    } else if (wmtsLayerConfig instanceof GeoAdminWMTSLayer) {
        provider = new UrlTemplateImageryProvider({
            rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten),
            maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
            url: url.value,
        })
    } else {
        log.error('Unknown WMTS layer type', wmtsLayerConfig, 'could not create 3D layer')
    }
    return provider
}

const { refreshLayer } = useAddImageryLayer(
    getViewer(),
    createProvider,
    () => zIndex,
    toRef(opacity)
)
</script>

<template>
    <slot />
</template>
