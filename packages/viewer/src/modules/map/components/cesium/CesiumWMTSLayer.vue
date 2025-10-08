<script setup lang="ts">
import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import {
    Rectangle,
    UrlTemplateImageryProvider,
    Viewer,
    WebMapTileServiceImageryProvider,
} from 'cesium'
import { computed, inject, onBeforeUnmount, toRef, watch, ref } from 'vue'

import type { ExternalWMTSLayer, GeoAdminWMTSLayer } from '@swissgeo/layers'
import { WMTSEncodingType } from '@swissgeo/layers'
import { getWmtsXyzUrl } from '@swissgeo/layers/utils'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import usePositionStore from '@/store/modules/position.store'
import useLayersStore from '@/store/modules/layers.store'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18
const unsupportedProjectionError = new ErrorMessage('3d_unsupported_projection')

const { wmtsLayerConfig, zIndex, parentLayerOpacity } = defineProps<{
    wmtsLayerConfig: GeoAdminWMTSLayer | ExternalWMTSLayer
    zIndex?: number
    parentLayerOpacity?: number | null
}>()

const getViewer = inject<() => Viewer | undefined>('getViewer', () => undefined)

const positionStore = usePositionStore()
const layersStore = useLayersStore()
const projection = computed(() => positionStore.projection)
const opacity = computed(() => parentLayerOpacity ?? wmtsLayerConfig.opacity ?? 1.0)

const url = computed(() =>
    getWmtsXyzUrl(wmtsLayerConfig, projection.value, {
        addTimestamp: true,
    })
)
// Track if we added an unsupported projection error to remove it later
const hasUnsupportedProjectionError = ref(false)

const tileMatrixSet = computed(() => {
    // Only external WMTS layers have tile matrix sets/options
    const external = wmtsLayerConfig as ExternalWMTSLayer
    const sets = external.tileMatrixSets
    if (!sets || sets.length === 0) {
        return undefined
    }
    const match = sets.find((set) => set.projection.epsg === projection.value.epsg)
    if (!match) {
        log.error(`External layer ${wmtsLayerConfig.id} does not support ${projection.value.epsg}`)
        if (!hasUnsupportedProjectionError.value) {
            layersStore.addLayerError(
                {
                    layerId: wmtsLayerConfig.id,
                    isExternal: wmtsLayerConfig.isExternal,
                    baseUrl: wmtsLayerConfig.baseUrl,
                    error: unsupportedProjectionError,
                },
                dispatcher
            )
            setHasUnsupportedProjectionError(true)
        }
        return undefined
    }
    // If we previously added an error but projection is now supported, remove the error
    if (hasUnsupportedProjectionError.value) {
        layersStore.removeLayerError(
            {
                layerId: wmtsLayerConfig.id,
                isExternal: wmtsLayerConfig.isExternal,
                baseUrl: wmtsLayerConfig.baseUrl,
                error: unsupportedProjectionError,
            },
            dispatcher
        )
        setHasUnsupportedProjectionError(false)
    }
    return match
})

function setHasUnsupportedProjectionError(value: boolean) {
    hasUnsupportedProjectionError.value = value
}
const tileMatrixSetId = computed(() => tileMatrixSet.value?.id ?? projection.value.epsg)
const tileMatrixLabels = computed(() =>
    (wmtsLayerConfig as ExternalWMTSLayer)?.options?.tileGrid?.getMatrixIds()
)

// Refresh the layer when the URL (timestamp) changes
watch(url, () => refreshLayer())

onBeforeUnmount(() => {
    if (hasUnsupportedProjectionError.value) {
        layersStore.removeLayerError(
            {
                layerId: wmtsLayerConfig.id,
                isExternal: wmtsLayerConfig.isExternal,
                baseUrl: wmtsLayerConfig.baseUrl,
                error: unsupportedProjectionError,
            },
            dispatcher
        )
    }
})

function createProvider(): WebMapTileServiceImageryProvider | UrlTemplateImageryProvider {
    let provider
    if (
        (wmtsLayerConfig as ExternalWMTSLayer).getTileEncoding !== undefined &&
        tileMatrixSetId.value
    ) {
        provider = new WebMapTileServiceImageryProvider({
            url:
                (wmtsLayerConfig as ExternalWMTSLayer).getTileEncoding === WMTSEncodingType.KVP
                    ? (wmtsLayerConfig as ExternalWMTSLayer).baseUrl
                    : (wmtsLayerConfig as ExternalWMTSLayer).urlTemplate,
            layer: (wmtsLayerConfig as ExternalWMTSLayer).id,
            style: (wmtsLayerConfig as ExternalWMTSLayer).style ?? 'default',
            tileMatrixSetID: tileMatrixSetId.value,
            tileMatrixLabels: tileMatrixLabels.value,
        })
    } else {
        provider = new UrlTemplateImageryProvider({
            rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten),
            maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
            url: url.value!,
        })
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
