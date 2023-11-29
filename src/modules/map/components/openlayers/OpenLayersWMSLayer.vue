<script setup>
/** Renders a WMS layer on the map */

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { WMS_TILE_SIZE } from '@/config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, toRef, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
    wmsLayerConfig: {
        type: [GeoAdminWMSLayer, ExternalWMSLayer],
        required: true,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
// if we do not wrap props around refs, we lose reactivity
const layerConfig = toRef(props, 'wmsLayerConfig')
const zIndex = toRef(props, 'zIndex')

// mapping relevant store values
const store = useStore()
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)
const currentLang = computed(() => store.state.i18n.lang)

// extracting useful info from what we've linked so far
const layerId = computed(() => layerConfig.value.serverLayerId || layerConfig.value.externalLayerId)
const wmsVersion = computed(() => layerConfig.value.wmsVersion || '1.3.0')
const format = computed(() => layerConfig.value.format || 'png')
const gutter = computed(() => layerConfig.value.gutter || -1)
const opacity = computed(() => layerConfig.value.opacity || 1.0)
const url = computed(() => layerConfig.value.getURL())
const timestamp = computed(() => getTimestampFromConfig(layerConfig.value, previewYear.value))

/**
 * Definition of all relevant URL param for our WMS backends. This is because both
 * https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html and
 * https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html have this
 * option.
 *
 * If we let the URL have all the param beforehand (sending all URL param through the url option),
 * most of our wanted params will be doubled, resulting in longer and more difficult to read URLs
 */
const wmsUrlParams = computed(() => ({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    TRANSPARENT: true,
    LAYERS: layerId.value,
    FORMAT: `image/${format.value}`,
    LANG: currentLang.value,
    VERSION: wmsVersion.value,
    TIME: timestamp.value,
    CRS: projection.value.epsg,
}))

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

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => layer.getSource().setUrl(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createSourceForProjection()))
</script>

<template>
    <slot />
</template>
