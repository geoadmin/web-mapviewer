<script setup>
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
watch(url, (newUrl) => layer.getSource().setUrl(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createWMTSSourceForProjection()))

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
    let tileGrid = null
    if (projection.value instanceof CustomCoordinateSystem) {
        const matrixIds = []

        for (let z = 0; z < projection.value.getResolutions().length; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            matrixIds[z] = z
        }

        tileGrid = new WMTSTileGrid({
            resolutions: projection.value.getResolutions(),
            origin: projection.value.getTileOrigin(),
            matrixIds: matrixIds,
            extent: projection.value.bounds.flatten,
        })
    }

    const wmtsUrl = url.value
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
    const wmtsSource = new WMTSSource({
        layer: layerId.value,
        format: wmtsLayerConfig.value.format,
        projection: projection.value.epsg,
        requestEncoding: 'REST',
        tileGrid,
        attributions: wmtsLayerConfig.value.attribution,
        url: wmtsUrl,
        style: 'default',
        transition: 0,
    })
    return wmtsSource
}
</script>

<template>
    <slot />
</template>
