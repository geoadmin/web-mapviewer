<script setup>
/** Renders a WMS layer on the map */

import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { ALL_YEARS_WMS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import { WMS_TILE_SIZE } from '@/config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { flattenExtent } from '@/utils/coordinates/coordinateUtils'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const props = defineProps({
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
const { wmsLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)
const currentLang = computed(() => store.state.i18n.lang)

// extracting useful info from what we've linked so far
const layerId = computed(() => wmsLayerConfig.value.technicalName || wmsLayerConfig.value.id)
const wmsVersion = computed(() => wmsLayerConfig.value.wmsVersion || '1.3.0')
const format = computed(() => wmsLayerConfig.value.format || 'png')
const gutter = computed(() => wmsLayerConfig.value.gutter || -1)
const opacity = computed(() => parentLayerOpacity.value ?? wmsLayerConfig.value.opacity)
const url = computed(() => wmsLayerConfig.value.baseUrl)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)
const timestamp = computed(() =>
    getTimestampFromConfig(wmsLayerConfig.value, previewYear.value, isTimeSliderActive.value)
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
    const params = {
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
    if (timestamp.value === ALL_YEARS_WMS_TIMESTAMP) {
        // To request all timestamp we need to set the TIME to null which will force openlayer
        // to send a request without TIME param, otherwise openlayer takes the previous TIME param.
        params.TIME = null
    }
    return params
})

let layer
if (gutter.value !== -1) {
    layer = new TileLayer({
        id: layerId.value,
        opacity: opacity.value,
        source: createSourceForProjection(),
    })
} else {
    layer = new ImageLayer({
        id: layerId.value,
        opacity: opacity.value,
        source: createSourceForProjection(),
    })
}
// If the layer config comes with an extent, we set it up to both types of WMS layer.
// That means that data will not be requested if the map viewport is outside the extent.
if (wmsLayerConfig.value.extent) {
    layer.setExtent(flattenExtent(wmsLayerConfig.value.extent))
}

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => layer.getSource().setUrl(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createSourceForProjection()))
watch(wmsUrlParams, () => {
    layer.getSource().updateParams(wmsUrlParams.value)
})

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
        })
    }
    if (projection.value instanceof CustomCoordinateSystem) {
        source.tileGrid = new TileGrid({
            resolutions: projection.value.getResolutions(),
            extent: projection.value.bounds.flatten,
            origin: projection.value.getTileOrigin(),
            tileSize: WMS_TILE_SIZE,
        })
    }
    return source
}
</script>

<template>
    <slot />
</template>
