<script setup lang="ts">
/** Renders a WMS layer on the map */

import type { Map } from 'ol'
import type { ExternalWMSLayer, GeoAdminWMSLayer } from '@swissgeo/layers'

import { extentUtils, LV95 } from '@swissgeo/coordinates'
import { cloneDeep } from 'lodash'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, watch, watchEffect } from 'vue'

import { ALL_YEARS_TIMESTAMP } from '@swissgeo/layers'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { WMS_TILE_SIZE } from '@/config/map.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { useI18nStore } from '@/store/modules/i18n.store'
import usePositionStore from '@/store/modules/position.store'
import { getTimestampFromConfig } from '@swissgeo/layers/utils'

interface Props {
    wmsLayerConfig: GeoAdminWMSLayer | ExternalWMSLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

// mapping relevant store values
const positionStore = usePositionStore()
const i18nStore = useI18nStore()
const projection = computed(() => positionStore.projection)
const currentLang = computed(() => i18nStore.lang)

// extracting useful info from what we've linked so far
const layerId = computed(() => ('technicalName' in props.wmsLayerConfig ? props.wmsLayerConfig.technicalName : props.wmsLayerConfig.id))
const wmsVersion = computed(() => props.wmsLayerConfig.wmsVersion || '1.3.0')
const format = computed(() => props.wmsLayerConfig.format || 'png')
const gutter = computed(() => ('gutter' in props.wmsLayerConfig ? props.wmsLayerConfig.gutter : -1) || -1)
const opacity = computed(() => props.parentLayerOpacity ?? props.wmsLayerConfig.opacity)
const url = computed(() => getBaseUrlOverride('wms') ?? props.wmsLayerConfig.baseUrl)
const timestamp = computed(() => getTimestampFromConfig(props.wmsLayerConfig))
const urlParams = computed(() => cloneDeep(props.wmsLayerConfig.customAttributes) ?? undefined)

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
        LANG: currentLang.value,
        VERSION: wmsVersion.value,
        CRS: projection.value.epsg,
        TIME: timestamp.value,
    }
    if (timestamp.value === ALL_YEARS_TIMESTAMP) {
        // To request all timestamp we need to set the TIME to undefined which will force openlayer
        // to send a request without TIME param, otherwise openlayer takes the previous TIME param.
        params.TIME = undefined
    }
    if (urlParams.value !== undefined) {
        params = { ...params, ...urlParams.value }
    }
    return params
})

let layer: TileLayer<TileWMS> | ImageLayer<ImageWMS>
if (gutter.value !== -1) {
    layer = new TileLayer({
        properties: {
            id: layerId.value,
            uuid: props.wmsLayerConfig.uuid,
        },
        opacity: opacity.value,
        source: createSourceForProjection() as TileWMS,
    })
} else {
    layer = new ImageLayer({
        properties: {
            id: layerId.value,
            uuid: props.wmsLayerConfig.uuid,
        },
        opacity: opacity.value,
        source: createSourceForProjection() as ImageWMS,
    })
}

setExtent()

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => {
    const source = layer.getSource()
    if (source) {
        source.setUrl(newUrl)
    }
})
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => {
    const newSource = createSourceForProjection()
    if (layer instanceof TileLayer) {
        layer.setSource(newSource as TileWMS)
    } else if (layer instanceof ImageLayer) {
        layer.setSource(newSource as ImageWMS)
    }
    setExtent()
})

watch(wmsUrlParams, () => {
    const source = layer.getSource()
    if (source) {
        source.updateParams(wmsUrlParams.value)
    }
})

watchEffect(() => {
    setExtent()
})

function createSourceForProjection(): TileWMS | ImageWMS {
    let source: TileWMS | ImageWMS
    if (gutter.value !== -1) {
        const tileGrid = !projection.value.usesMercatorPyramid && projection.value.bounds
            ? new TileGrid({
                resolutions: projection.value.getResolutionSteps().map((step) => step.resolution),
                extent: projection.value.bounds.flatten,
                origin: projection.value.getTileOrigin(),
                tileSize: WMS_TILE_SIZE,
            })
            : undefined

        source = new TileWMS({
            projection: projection.value.epsg,
            url: url.value,
            gutter: gutter.value,
            params: wmsUrlParams.value,
            tileGrid: tileGrid,
        })
    } else {
        source = new ImageWMS({
            url: url.value,
            projection: projection.value.epsg,
            params: wmsUrlParams.value,
            // Limiting image request to exactly the size of the map viewport.
            // We have a couple layers that state when they have lastly been updated at the bottom
            // of the WMS image, and without this ratio prop this label is out of the map viewport.
            // (e.g. ch.bazl.luftfahrthindernis)
            ratio: 1,
        })
    }
    return source
}

// If the layer config comes with an extent, we set it up to both types of WMS layer.
// That means that data will not be requested if the map viewport is outside the extent.
function setExtent(): void {
    if (props.wmsLayerConfig.extent) {
        layer.setExtent(extentUtils.flattenExtent(props.wmsLayerConfig.extent))
    } else if (props.wmsLayerConfig.constructor.name === 'GeoAdminWMSLayer') {
        // do not request stuff outside our technical extent with our own layers.
        const bounds = LV95.getBoundsAs(projection.value)
        if (bounds) {
            layer.setExtent(bounds.flatten)
        }
    }
}
</script>

<template>
    <slot />
</template>
