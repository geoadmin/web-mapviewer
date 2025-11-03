<script setup lang="ts">
import type { ExternalWMTSLayer, GeoAdminWMTSLayer } from '@swissgeo/layers'

import { WGS84 } from '@swissgeo/coordinates'
import { WMTSEncodingType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import {
    Rectangle,
    UrlTemplateImageryProvider,
    type Viewer,
    WebMapTileServiceImageryProvider,
} from 'cesium'
import { computed, inject, onBeforeUnmount, ref, type ShallowRef, toRef, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18
const unsupportedProjectionError = new ErrorMessage('3d_unsupported_projection')

const {
    wmtsLayerConfig,
    zIndex = -1,
    parentLayerOpacity,
} = defineProps<{
    wmtsLayerConfig: GeoAdminWMTSLayer | ExternalWMTSLayer
    zIndex?: number
    parentLayerOpacity?: number
}>()
const viewer = inject<ShallowRef<Viewer | undefined>>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumWMTSLayer.vue',
        messages: ['Viewer not initialized, cannot create WMTS layer'],
    })
    throw new Error('Viewer not initialized, cannot create WMTS layer')
}

const positionStore = usePositionStore()
const layersStore = useLayersStore()
const opacity = computed(() => parentLayerOpacity ?? wmtsLayerConfig.opacity ?? 1.0)

const url = computed(() =>
    layerUtils.getWmtsXyzUrl(wmtsLayerConfig, positionStore.projection, {
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
    const match = sets.find((set) => set.projection.epsg === positionStore.projection.epsg)
    if (!match) {
        log.error(
            `External layer ${wmtsLayerConfig.id} does not support ${positionStore.projection.epsg}`
        )
        if (!hasUnsupportedProjectionError.value) {
            layersStore.addLayerError(
                wmtsLayerConfig,
                {
                    isExternal: wmtsLayerConfig.isExternal,
                    baseUrl: wmtsLayerConfig.baseUrl,
                },
                unsupportedProjectionError,
                dispatcher
            )
            setHasUnsupportedProjectionError(true)
        }
        return undefined
    }
    // If we previously added an error but projection is now supported, remove the error
    if (hasUnsupportedProjectionError.value) {
        layersStore.removeLayerError(
            wmtsLayerConfig,
            {
                isExternal: wmtsLayerConfig.isExternal,
                baseUrl: wmtsLayerConfig.baseUrl,
            },
            unsupportedProjectionError,
            dispatcher
        )
        setHasUnsupportedProjectionError(false)
    }
    return match
})

function setHasUnsupportedProjectionError(value: boolean) {
    hasUnsupportedProjectionError.value = value
}
const tileMatrixSetId = computed(() => tileMatrixSet.value?.id ?? positionStore.projection.epsg)
const tileMatrixLabels = computed(() =>
    (wmtsLayerConfig as ExternalWMTSLayer)?.options?.tileGrid?.getMatrixIds()
)

// Refresh the layer when the URL (timestamp) changes
watch(url, () => refreshLayer())

onBeforeUnmount(() => {
    if (hasUnsupportedProjectionError.value) {
        layersStore.removeLayerError(
            wmtsLayerConfig,
            {
                isExternal: wmtsLayerConfig.isExternal,
                baseUrl: wmtsLayerConfig.baseUrl,
            },
            unsupportedProjectionError,
            dispatcher
        )
    }
})

function createProvider(): WebMapTileServiceImageryProvider | UrlTemplateImageryProvider {
    let provider
    const wmtsLayerConfigExternal = wmtsLayerConfig as ExternalWMTSLayer
    if (wmtsLayerConfigExternal.getTileEncoding !== undefined && tileMatrixSetId.value) {
        provider = new WebMapTileServiceImageryProvider({
            url:
                wmtsLayerConfigExternal.getTileEncoding === WMTSEncodingType.KVP
                    ? wmtsLayerConfigExternal.baseUrl
                    : wmtsLayerConfigExternal.urlTemplate,
            layer: wmtsLayerConfigExternal.id,
            style: wmtsLayerConfigExternal.style ?? 'default',
            tileMatrixSetID: tileMatrixSetId.value,
            tileMatrixLabels: tileMatrixLabels.value,
        })
    } else {
        provider = new UrlTemplateImageryProvider({
            rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84)!.flatten),
            maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
            url: url.value!,
        })
    }
    return provider
}

const { refreshLayer } = useAddImageryLayer(
    viewer,
    createProvider,
    toRef(() => zIndex),
    toRef(opacity)
)
</script>

<template>
    <slot />
</template>
