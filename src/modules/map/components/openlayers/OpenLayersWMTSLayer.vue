<script setup>
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { getTimestampFromConfig, getWmtsXyzUrl } from '@/utils/layerUtils'

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
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)
// extracting useful info from what we've linked so far
const layerId = computed(() => wmtsLayerConfig.value.technicalName)
const opacity = computed(() => parentLayerOpacity.value ?? wmtsLayerConfig.value.opacity)
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(
    () =>
        getTimestampFromConfig(
            wmtsLayerConfig.value,
            previewYear.value,
            isTimeSliderActive.value
        ) ?? 'current'
)
const wmtsSourceConfig = computed(() => {
    return {
        dimensions: {
            Time: timestamp.value,
        },
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

function getTransformedXYZUrl() {
    return getWmtsXyzUrl(
        wmtsLayerConfig.value,
        projection.value,
        previewYear.value,
        isTimeSliderActive.value
    )
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
}

function createTileGridForProjection() {
    return new WMTSTileGrid({
        resolutions: projection.value.getResolutions(),
        origin: projection.value.getTileOrigin(),
        matrixIds: projection.value.getMatrixIds(),
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
    // TODO : in WMTSSource : overload getTile to have z set to maxZoom or make retrys until we find the good one
    // wmtsSourceConfig should have a maxzoom, WMTSSource should store maxZoom
    return new WMTSSource(wmtsSourceConfig.value)
}
</script>

<template>
    <slot />
</template>
