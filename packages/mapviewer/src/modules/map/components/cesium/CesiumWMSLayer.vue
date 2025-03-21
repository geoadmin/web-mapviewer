<script setup>
import { WGS84 } from '@geoadmin/coordinates'
import { Rectangle, WebMapServiceImageryProvider } from 'cesium'
import { cloneDeep } from 'lodash'
import { computed, inject, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { ALL_YEARS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const MAXIMUM_LEVEL_OF_DETAILS = 18

const { wmsLayerConfig, zIndex, parentLayerOpacity } = defineProps({
    wmsLayerConfig: {
        type: [GeoAdminWMSLayer, ExternalWMSLayer],
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
const currentLang = computed(() => store.state.i18n.lang)

const layerId = computed(() => wmsLayerConfig.technicalName ?? wmsLayerConfig.id)
const opacity = computed(() => parentLayerOpacity ?? wmsLayerConfig.opacity ?? 1.0)
const wmsVersion = computed(() => wmsLayerConfig.wmsVersion ?? '1.3.0')
const format = computed(() => wmsLayerConfig.format ?? 'png')
const url = computed(() => getBaseUrlOverride('wms') ?? wmsLayerConfig.baseUrl)
const timestamp = computed(() => getTimestampFromConfig(wmsLayerConfig))
const customAttributes = computed(() => cloneDeep(wmsLayerConfig.customAttributes))

/**
 * Definition of all relevant URL param for our WMS backends. Passes as parameters to
 * https://cesium.com/learn/cesiumjs/ref-doc/WebMapServiceImageryProvider.html#.ConstructorOptions
 *
 * If we let the URL have all the param beforehand (sending all URL param through the url option),
 * most of our wanted params will be doubled, resulting in longer and more difficult to read URLs
 *
 * @returns Object
 */
const wmsUrlParams = computed(() => {
    let params = {
        SERVICE: 'WMS',
        REQUEST: 'GetMap',
        TRANSPARENT: true,
        LAYERS: layerId.value,
        FORMAT: `image/${format.value}`,
        LANG: currentLang.value,
        VERSION: wmsVersion.value,
    }
    if (timestamp.value && timestamp.value !== ALL_YEARS_TIMESTAMP) {
        params.TIME = timestamp.value
    }
    if (customAttributes.value) {
        params = { ...params, ...customAttributes.value }
    }
    return params
})

watch(wmsUrlParams, () => refreshLayer(), { deep: true })

function createProvider() {
    return new WebMapServiceImageryProvider({
        url: url.value,
        parameters: wmsUrlParams.value,
        layers: layerId.value,
        maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
        enablePickFeatures: false,
        rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten),
    })
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
