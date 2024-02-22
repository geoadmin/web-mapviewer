<script setup>
import { getTopLeft, getWidth } from 'ol/extent'
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
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
    let resolutions = []
    let origin = null
    let extent = null

    if (projection.value instanceof CustomCoordinateSystem) {
        resolutions = projection.value.getResolutions()
        origin = projection.value.getTileOrigin()
        extent = projection.value.bounds.flatten
    } else {
        // TODO(IS): move this to the projection class?
        extent = projection.value.bounds.flatten
        origin = getTopLeft(extent)
        const size = getWidth(extent) / 256
        resolutions = []
        for (let z = 0; z < 19; ++z) {
            resolutions[z] = size / Math.pow(2, z)
        }
    }

    const matrixIds = []

    for (let z = 0; z < resolutions.length; ++z) {
        // generate resolutions and matrixIds arrays for this WMTS
        matrixIds[z] = z
    }

    const tileGrid = new WMTSTileGrid({
        resolutions: resolutions,
        origin: origin,
        matrixIds: matrixIds,
        extent: extent,
    })

    const wmtsSource = new WMTSSource({
        layer: layerId.value,
        format: wmtsLayerConfig.value.format,
        projection: projection.value.epsg,
        requestEncoding: 'REST',
        tileGrid,
        attributions: wmtsLayerConfig.value.attribution,
        url: getWMTSUrl(url.value),
        style: 'default',
        transition: 0,
        matrixSet: projection.value.epsg,
    })
    return wmtsSource
}
</script>

<template>
    <slot />
</template>
