<script setup lang="ts">
import { WGS84 } from '@swissgeo/coordinates'
import { Rectangle, type Viewer, WebMapServiceImageryProvider } from 'cesium'
import { cloneDeep } from 'lodash'
import { computed, inject, toRef, watch } from 'vue'

import type { ExternalWMSLayer, GeoAdminWMSLayer } from '@swissgeo/layers'
import { ALL_YEARS_TIMESTAMP } from '@swissgeo/layers'
import log from '@swissgeo/log'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useAddImageryLayer from '@/modules/map/components/cesium/utils/useAddImageryLayer.composable'
import { timeConfigUtils } from '@swissgeo/layers/utils'
import useI18nStore from '@/store/modules/i18n.store'

const MAXIMUM_LEVEL_OF_DETAILS = 18

const {
    wmsLayerConfig,
    zIndex = -1,
    parentLayerOpacity,
} = defineProps<{
    wmsLayerConfig: GeoAdminWMSLayer | ExternalWMSLayer
    zIndex?: number
    parentLayerOpacity?: number
}>()

const viewer = inject<Viewer | undefined>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumWMSLayer.vue',
        message: ['Viewer not initialized, cannot create WMS layer'],
    })
    throw new Error('Viewer not initialized, cannot create WMS layer')
}

const i18nStore = useI18nStore()
const currentLang = computed(() => i18nStore.lang)

const layerId = computed(() =>
    'technicalName' in wmsLayerConfig
        ? (wmsLayerConfig.technicalName ?? wmsLayerConfig.id)
        : wmsLayerConfig.id
)
const opacity = computed(() => parentLayerOpacity ?? wmsLayerConfig.opacity ?? 1.0)
const wmsVersion = computed(() => wmsLayerConfig.wmsVersion ?? '1.3.0')
const format = computed(() => wmsLayerConfig.format ?? 'png')
const url = computed(() => getBaseUrlOverride('wms') ?? wmsLayerConfig.baseUrl)
const timestamp = computed(() => timeConfigUtils.getTimestampFromConfig(wmsLayerConfig))
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
    let params: Record<string, unknown> = {
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
        rectangle: Rectangle.fromDegrees(...DEFAULT_PROJECTION.getBoundsAs(WGS84)!.flatten),
    })
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
