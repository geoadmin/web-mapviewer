<script setup>
import { Rectangle, UrlTemplateImageryProvider, WebMapTileServiceImageryProvider } from 'cesium'
import { computed, inject, onBeforeUnmount, toRef, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer, { WMTSEncodingTypes } from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import ErrorMessage from '@/utils/ErrorMessage.class'
import { getWmtsXyzUrl } from '@/utils/layerUtils'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18
const unsupportedProjectionError = new ErrorMessage('3d_unsupported_projection')

const props = defineProps({
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

const { wmtsLayerConfig, zIndex, parentLayerOpacity } = toRefs(props)

const getViewer = inject('getViewer')

const store = useStore()
const projection = computed(() => store.state.position.projection)
const opacity = computed(() => parentLayerOpacity.value ?? wmtsLayerConfig.value.opacity ?? 1.0)
const currentYear = computed(() => wmtsLayerConfig.value.timeConfig?.currentYear)

const url = computed(() =>
    getWmtsXyzUrl(wmtsLayerConfig.value, projection.value, {
        addTimestamp: true,
    })
)
const tileMatrixSet = computed(() => {
    if (!wmtsLayerConfig.value.tileMatrixSets) {
        return null
    }
    if (
        !wmtsLayerConfig.value.tileMatrixSets.some(
            (set) => set.projection.epsg === projection.value.epsg
        )
    ) {
        log.error(
            `External layer ${wmtsLayerConfig.value.id} does not support ${projection.value.epsg}`
        )
        store.dispatch('addLayerError', {
            layerId: wmtsLayerConfig.value.id,
            isExternal: wmtsLayerConfig.value.isExternal,
            baseUrl: wmtsLayerConfig.value.baseUrl,
            error: unsupportedProjectionError,
            ...dispatcher,
        })
    }
    return wmtsLayerConfig.value.tileMatrixSets
})
const tileMatrixSetId = computed(() => tileMatrixSet.value?.id ?? projection.value.epsg)
const tileMatrixLabels = computed(() => wmtsLayerConfig.value?.options?.tileGrid?.getMatrixIds())

watch(currentYear, () => {
    refreshLayer()
})

onBeforeUnmount(() => {
    if (wmtsLayerConfig.value.containErrorMessage(unsupportedProjectionError)) {
        store.dispatch('removeLayerError', {
            layerId: wmtsLayerConfig.value.id,
            isExternal: wmtsLayerConfig.value.isExternal,
            baseUrl: wmtsLayerConfig.value.baseUrl,
            error: unsupportedProjectionError,
            ...dispatcher,
        })
    }
})

function createProvider() {
    let provider
    if (wmtsLayerConfig.value instanceof ExternalWMTSLayer && tileMatrixSetId.value) {
        provider = new WebMapTileServiceImageryProvider({
            url:
                wmtsLayerConfig.value.getTileEncoding === WMTSEncodingTypes.KVP
                    ? wmtsLayerConfig.value.baseUrl
                    : wmtsLayerConfig.value.urlTemplate,
            layer: wmtsLayerConfig.value.id,
            style: wmtsLayerConfig.value.style,
            tileMatrixSetID: tileMatrixSetId.value,
            tileMatrixLabels: tileMatrixLabels.value,
        })
    } else if (wmtsLayerConfig.value instanceof GeoAdminWMTSLayer) {
        provider = new UrlTemplateImageryProvider({
            rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten),
            maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
            url: url.value,
        })
    } else {
        log.error('Unknown WMTS layer type', wmtsLayerConfig.value, 'could not create 3D layer')
    }
    return provider
}

const { refreshLayer } = useAddImageryLayer(
    getViewer(),
    createProvider,
    toRef(zIndex),
    toRef(opacity)
)
</script>

<template>
    <slot />
</template>
