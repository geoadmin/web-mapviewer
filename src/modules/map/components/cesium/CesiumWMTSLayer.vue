<script setup>
import { Rectangle, UrlTemplateImageryProvider, WebMapTileServiceImageryProvider } from 'cesium'
import { isEqual } from 'lodash'
import { computed, inject, onBeforeUnmount, toRef, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer, { WMTSEncodingTypes } from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getTimestampFromConfig, getWmtsXyzUrl } from '@/utils/layerUtils'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18
const threeDErrorKey = '3d_unsupported_projection'

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
const url = computed(() =>
    getWmtsXyzUrl(wmtsLayerConfig.value, projection.value, {
        addTimestamp: true,
    })
)
const tileMatrixSet = computed(() => {
    const set =
        wmtsLayerConfig.value.tileMatrixSets.find(
            (set) => set.projection.epsg === projection.value.epsg
        ) ?? null
    if (!set) {
        log.error(
            `External layer ${wmtsLayerConfig.value.id} does not support ${projection.value.epsg}`
        )
        store.dispatch('addLayerErrorKey', {
            layerId: wmtsLayerConfig.value.id,
            errorKey: threeDErrorKey,
            ...dispatcher,
        })
    }
    return set
})
const tileMatrixSetId = computed(() => tileMatrixSet.value?.id ?? '')
const dimensions = computed(() => {
    const dimensions = {}
    wmtsLayerConfig.value.dimensions?.reduce((acc, dimension) => {
        if (dimension.current) {
            acc[dimension.id] = 'current'
        } else {
            acc[dimension.id] = dimension.values[0]
        }
    }, dimensions)
    if (wmtsLayerConfig.value.hasMultipleTimestamps) {
        // if we have a time config use it as dimension
        const timestamp = getTimestampFromConfig(wmtsLayerConfig.value)
        // overwrite any Time, TIME or time dimension
        const timeDimension = Object.entries(dimensions).find((e) => e[0].toLowerCase() === 'time')
        if (timeDimension) {
            dimensions[timeDimension[0]] = timestamp
        }
    }

    return dimensions
})

onBeforeUnmount(() => {
    if (wmtsLayerConfig.value.hasErrorKey(threeDErrorKey)) {
        store.dispatch('removeLayerErrorKey', {
            layerId: wmtsLayerConfig.value.id,
            errorKey: threeDErrorKey,
            ...dispatcher,
        })
    }
})

watch(dimensions, (newDimension, oldDimension) => {
    if (!isEqual(newDimension, oldDimension)) {
        log.debug(`layer dimension have been updated`, oldDimension, newDimension)
        // this.updateLayer()
    }
})

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
        dimensions: dimensions.value,
    })
} else {
    provider = new UrlTemplateImageryProvider({
        rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten),
        maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
        url: url.value,
    })
}
useAddImageryLayer(getViewer(), provider, toRef(zIndex), toRef(opacity))
</script>

<template>
    <slot />
</template>

