<script setup lang="ts">
/** Renders a WMS layer on the map */
import type { ExternalWMSLayer, GeoAdminWMSLayer, LayerCustomAttributes } from '@swissgeo/layers'
import { ALL_YEARS_TIMESTAMP } from '@swissgeo/layers'
import { timeConfigUtils } from '@swissgeo/layers/utils'
import type { Map } from 'ol'
import { extentUtils, LV95 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, toRef, watch, watchEffect } from 'vue'

import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { WMS_TILE_SIZE } from '@/config/map.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position'
import useI18nStore from '@/store/modules/i18n'

const {
    wmsLayerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    wmsLayerConfig: GeoAdminWMSLayer | ExternalWMSLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

const positionStore = usePositionStore()
const i18nStore = useI18nStore()

// extracting useful info from what we've linked so far
const layerId = computed(() => {
    if (!wmsLayerConfig.isExternal && (wmsLayerConfig as GeoAdminWMSLayer).technicalName) {
        return (wmsLayerConfig as GeoAdminWMSLayer).technicalName
    }
    return wmsLayerConfig.id
})
const wmsVersion = computed(() => wmsLayerConfig.wmsVersion ?? '1.3.0')
const format = computed(() => wmsLayerConfig.format ?? 'png')
const gutter = computed(() => {
    if (!wmsLayerConfig.isExternal && (wmsLayerConfig as GeoAdminWMSLayer).gutter) {
        return (wmsLayerConfig as GeoAdminWMSLayer).gutter
    }
    return -1
})
const opacity = computed(() => parentLayerOpacity ?? wmsLayerConfig.opacity)
const url = computed(() => getBaseUrlOverride('wms') ?? wmsLayerConfig.baseUrl)
const timestamp = computed(() => timeConfigUtils.getTimestampFromConfig(wmsLayerConfig))
const urlParams = computed<LayerCustomAttributes | undefined>(() =>
    cloneDeep(wmsLayerConfig.customAttributes)
)

/**
 * Definition of all relevant URL param for our WMS backends. This is because both
 * https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html and
 * https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html have this
 * option.
 *
 * If we let the URL have all the param beforehand (sending all URL param through the url option),
 * most of our wanted params will be doubled, resulting in longer and more difficult to read URLs
 */
const wmsUrlParams = computed(() => {
    let params: Record<string, string | boolean | number | undefined> = {
        SERVICE: 'WMS',
        REQUEST: 'GetMap',
        TRANSPARENT: format.value === 'png',
        LAYERS: layerId.value,
        FORMAT: `image/${format.value}`,
        LANG: i18nStore.lang,
        VERSION: wmsVersion.value,
        CRS: positionStore.projection.epsg,
        TIME: timestamp.value,
    }
    if (timestamp.value === ALL_YEARS_TIMESTAMP) {
        // To request all timestamp we need to set the TIME to undefined which will force openlayer
        // to send a request without TIME param, otherwise openlayer takes the previous TIME param.
        params.TIME = undefined
    }
    if (urlParams.value) {
        params = { ...params, ...urlParams.value }
    }
    return params
})

let layer: TileLayer<TileWMS> | ImageLayer<ImageWMS>
if (gutter.value !== -1) {
    layer = new TileLayer<TileWMS>({
        properties: {
            id: layerId.value,
            uuid: wmsLayerConfig.uuid,
        },
        opacity: opacity.value,
        source: createTileWMSSource(),
    })
} else {
    layer = new ImageLayer<ImageWMS>({
        properties: {
            id: layerId.value,
            uuid: wmsLayerConfig.uuid,
        },
        opacity: opacity.value,
        source: createImageWMSSource(),
    })
}

setExtent()

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap component not found')
    throw new Error('OpenLayersMap component not found')
}
useAddLayerToMap(
    layer,
    olMap,
    toRef(() => zIndex)
)

// reacting to changes accordingly
watch(url, (newUrl) => {
    const source = layer.getSource()
    if (source) {
        source.setUrl(newUrl)
    }
})
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(
    () => positionStore.projection,
    () => {
        if (gutter.value !== -1) {
            ;(layer as TileLayer<TileWMS>).setSource(createTileWMSSource())
        } else {
            ;(layer as ImageLayer<ImageWMS>).setSource(createImageWMSSource())
        }
        setExtent()
    }
)

watch(wmsUrlParams, () => {
    const source = layer.getSource()
    if (source) {
        source.updateParams(wmsUrlParams.value)
    }
})

watchEffect(() => {
    setExtent()
})

function createTileWMSSource(): TileWMS {
    return new TileWMS({
        projection: positionStore.projection.epsg,
        url: url.value,
        gutter: gutter.value,
        params: wmsUrlParams.value,
        tileGrid: !positionStore.projection.usesMercatorPyramid
            ? new TileGrid({
                  resolutions: positionStore.projection
                      .getResolutionSteps()
                      .map((step) => step.resolution),
                  extent: positionStore.projection.bounds?.flatten,
                  origin: positionStore.projection.getTileOrigin(),
                  tileSize: WMS_TILE_SIZE,
              })
            : undefined,
    })
}

function createImageWMSSource(): ImageWMS {
    return new ImageWMS({
        url: url.value,
        projection: positionStore.projection.epsg,
        params: wmsUrlParams.value,
        // Limiting image request to exactly the size of the map viewport.
        // We have a couple layers that state when they have lastly been updated at the bottom
        // of the WMS image, and without this ratio prop this label is out of the map viewport.
        // (e.g. ch.bazl.luftfahrthindernis)
        ratio: 1,
    })
}

// If the layer config comes with an extent, we set it up to both types of WMS layer.
// That means that data will not be requested if the map viewport is outside the extent.
function setExtent() {
    if (wmsLayerConfig.extent) {
        layer.setExtent(extentUtils.flattenExtent(wmsLayerConfig.extent))
    } else if (!wmsLayerConfig.isExternal) {
        // do not request stuff outside our technical extent with our own layers.
        layer.setExtent(LV95.getBoundsAs(positionStore.projection)?.flatten)
    }
}
</script>

<template>
    <slot />
</template>
