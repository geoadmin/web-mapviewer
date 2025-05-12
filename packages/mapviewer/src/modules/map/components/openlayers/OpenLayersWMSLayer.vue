<script setup>
/** Renders a WMS layer on the map */

import { LV95 } from '@geoadmin/coordinates'
import { cloneDeep } from 'lodash'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { ALL_YEARS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { WMS_TILE_SIZE } from '@/config/map.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { flattenExtent } from '@/utils/extentUtils'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const { wmsLayerConfig, parentLayerOpacity, zIndex } = defineProps({
    wmsLayerConfig: {
        type: [GeoAdminWMSLayer, ExternalWMSLayer],
        required: true,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)
const currentLang = computed(() => store.state.i18n.lang)

// extracting useful info from what we've linked so far
const layerId = computed(() => wmsLayerConfig.technicalName || wmsLayerConfig.id)
const wmsVersion = computed(() => wmsLayerConfig.wmsVersion || '1.3.0')
const format = computed(() => wmsLayerConfig.format || 'png')
const gutter = computed(() => wmsLayerConfig.gutter || -1)
const opacity = computed(() => parentLayerOpacity ?? wmsLayerConfig.opacity)
const url = computed(() => getBaseUrlOverride('wms') ?? wmsLayerConfig.baseUrl)
const timestamp = computed(() => getTimestampFromConfig(wmsLayerConfig))
const urlParams = computed(() => cloneDeep(wmsLayerConfig.customAttributes) ?? null)

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
    let params = {
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
        // To request all timestamp we need to set the TIME to null which will force openlayer
        // to send a request without TIME param, otherwise openlayer takes the previous TIME param.
        params.TIME = null
    }
    if (urlParams.value !== null) {
        params = { ...params, ...urlParams.value }
    }
    return params
})

let layer
if (gutter.value !== -1) {
    layer = new TileLayer({
        id: layerId.value,
        uuid: wmsLayerConfig.uuid,
        opacity: opacity.value,
        source: createSourceForProjection(),
    })
} else {
    layer = new ImageLayer({
        id: layerId.value,
        uuid: wmsLayerConfig.uuid,
        opacity: opacity.value,
        source: createSourceForProjection(),
    })
}

setExtent()

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, () => zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => layer.getSource().setUrl(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => {
    layer.setSource(createSourceForProjection())
    setExtent()
})

watch(wmsUrlParams, layer.getSource().updateParams(wmsUrlParams.value))
watch(() => wmsLayerConfig.extent, setExtent)

function createSourceForProjection() {
    let source = null
    if (gutter.value !== -1) {
        source = new TileWMS({
            projection: projection.value.epsg,
            url: url.value,
            gutter: gutter.value,
            params: wmsUrlParams.value,
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
    if (!projection.value.usesMercatorPyramid) {
        source.tileGrid = new TileGrid({
            resolutions: projection.value.getResolutionSteps().map((step) => step.resolution),
            extent: projection.value.bounds.flatten,
            origin: projection.value.getTileOrigin(),
            tileSize: WMS_TILE_SIZE,
        })
    }
    return source
}

// If the layer config comes with an extent, we set it up to both types of WMS layer.
// That means that data will not be requested if the map viewport is outside the extent.
function setExtent() {
    if (wmsLayerConfig.extent) {
        layer.setExtent(flattenExtent(wmsLayerConfig.extent))
    } else if (wmsLayerConfig instanceof GeoAdminWMSLayer) {
        // do not request stuff outside our technical extent with our own layers.
        layer.setExtent(LV95.getBoundsAs(projection.value).flatten)
    }
}
</script>

<template>
    <slot />
</template>
