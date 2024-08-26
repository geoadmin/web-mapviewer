<script setup>
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { getTimestampFromConfig, getWmtsXyzUrl, indexOfMaxResolution } from '@/utils/layerUtils'
import log from '@/utils/logging'

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
const projection = computed(() => store.state.position.projection)
// extracting useful info from what we've linked so far
const layerId = computed(() => wmtsLayerConfig.value.technicalName)
const maxResolution = computed(() => wmtsLayerConfig.value.maxResolution)
const opacity = computed(() => parentLayerOpacity.value ?? wmtsLayerConfig.value.opacity)
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => getTimestampFromConfig(wmtsLayerConfig.value))
const wmtsSourceConfig = computed(() => {
    return {
        // No local cache, so that our CloudFront cache is always used. Was creating an issue on mf-geoadmin3, see :
        // https://github.com/geoadmin/mf-geoadmin3/issues/3491
        cacheSize: 0,
        layer: layerId.value,
        format: wmtsLayerConfig.value.format,
        projection: projection.value.epsg,
        tileGrid: createTileGridForProjection(),
        url: getTransformedXYZUrl(),
        matrixSet: projection.value.epsg,
        attributions: wmtsLayerConfig.value.attribution,
        // so that XYZ values will be filled as TileCol, TileRow and TileMatrix in the URL (see getWMTSUrl below)
        requestEncoding: 'REST',
    }
})
const wmtsTimeConfig = computed(() => {
    return { dimensions: { Time: timestamp.value } }
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
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createWMTSSourceForProjection()))
watch(wmtsSourceConfig, () => layer.setSource(createWMTSSourceForProjection()), { deep: true })
watch(wmtsTimeConfig, () => {
    log.debug('Update wmts dimension', wmtsTimeConfig.value)
    layer.getSource().updateDimensions(wmtsTimeConfig.value.dimensions)
})

function getTransformedXYZUrl() {
    return getWmtsXyzUrl(wmtsLayerConfig.value, projection.value)
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
}

/** @returns {WMTSTileGrid} The tile grid system for the wmts source */
function createTileGridForProjection() {
    const maxResolutionIndex = indexOfMaxResolution(projection.value, maxResolution.value)
    let resolutions = projection.value.getResolutions()
    let matrixIds = projection.value.getMatrixIds()
    if (resolutions.length > maxResolutionIndex) {
        resolutions = resolutions.slice(0, maxResolutionIndex + 1)
        matrixIds = matrixIds.slice(0, maxResolutionIndex + 1)
    }
    return new WMTSTileGrid({
        resolutions,
        origin: projection.value.getTileOrigin(),
        matrixIds,
        extent: projection.value.bounds.flatten,
    })
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
    log.debug('Create new WMTS source for projection', wmtsSourceConfig.value, wmtsTimeConfig.value)
    return new WMTSSource({ ...wmtsSourceConfig.value, ...wmtsTimeConfig.value })
}
</script>

<template>
    <slot />
</template>
