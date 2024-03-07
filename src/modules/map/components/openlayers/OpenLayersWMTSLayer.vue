<script setup>
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const props = defineProps({
    wmtsLayerConfig: {
        type: GeoAdminWMTSLayer,
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
const { wmtsLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => wmtsLayerConfig.value.technicalName)
const opacity = computed(() => parentLayerOpacity.value || wmtsLayerConfig.value.opacity)
const url = computed(() => {
    return wmtsLayerConfig.value.getURL(
        projection.value.epsgNumber,
        getTimestampFromConfig(wmtsLayerConfig.value, previewYear.value)
    )
})

const layer = new TileLayer({
    id: layerId.value,
    opacity: opacity.value,
    source: createWMTSSourceForProjection(),
})

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => {
    layer.getSource().setUrl(getWMTSUrl(newUrl))
})
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createWMTSSourceForProjection()))

function getWMTSUrl(xyzUrl) {
    return xyzUrl
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
}

/**
 * Returns an OpenLayers WMTS source, with some customization depending on the projection being
 * used.
 *
 * If the projection is a CustomCoordinateSystem, it will set the extent of this projection to a
 * dedicated TileGrid object, meaning that tiles outside the extent won't be requested.
 *
 * If the projection is not a CustomCoordinateSystem, it will default to a worldwide coverage,
 * meaning no limit where tiles shouldn't be requested.
 *
 * @returns {WMTSSource}
 */
function createWMTSSourceForProjection() {
    const resolutions = projection.value.getResolutions()
    const origin = projection.value.getTileOrigin()
    const extent = projection.value.bounds.flatten
    const matrixIds = projection.value.getMatrixIds()

    const tileGrid = new WMTSTileGrid({
        resolutions: resolutions,
        origin: origin,
        matrixIds: matrixIds,
        extent: extent,
    })
    // const timestamp = getTimestampFromConfig(wmtsLayerConfig.value, previewYear.value)

    // NOTE(IS): The following code is taken from the old geoadmin
    // For some obscure reasons, on iOS, displaying a base 64 image
    // in a tile with an existing crossOrigin attribute generates
    // CORS errors.
    // Currently crossOrigin definition is only used for mouse cursor
    // detection on desktop in TooltipDirective.
    let crossOrigin = 'anonymous'
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        crossOrigin = undefined
    }
    const wmtsSource = new WMTSSource({
        // dimensions: {
        //     Time: timestamp,
        // },

        // Workaround: Set a cache size of zero when layer is
        // timeEnabled see:
        // https://github.com/geoadmin/mf-geoadmin3/issues/3491
        cacheSize: wmtsLayerConfig.value.timeEnabled ? 0 : 2048,
        layer: layerId.value,
        format: wmtsLayerConfig.value.format,
        projection: projection.value.epsg,
        requestEncoding: 'REST',
        tileGrid,
        // tileLoadFunction: tileLoadFunction,
        url: getWMTSUrl(url.value),
        crossOrigin: crossOrigin,
        transition: 0,
        style: 'default',
        matrixSet: projection.value.epsg,
        attributions: wmtsLayerConfig.value.attribution,
    })
    return wmtsSource
}
</script>

<template>
    <slot />
</template>
