<script setup>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ as XYZSource } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
    wmtsLayerConfig: {
        type: GeoAdminWMTSLayer,
        required: true,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
// if we do not wrap props around refs, we lose reactivity
const { wmtsLayerConfig, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => wmtsLayerConfig.value.serverLayerId)
const opacity = computed(() => wmtsLayerConfig.value.opacity)
const url = computed(() => {
    return wmtsLayerConfig.value.getURL(
        projection.value.epsgNumber,
        getTimestampFromConfig(wmtsLayerConfig.value, previewYear.value)
    )
})

const layer = new TileLayer({
    id: layerId.value,
    opacity: opacity.value,
    source: createXYZSourceForProjection(),
})

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

// reacting to changes accordingly
watch(url, (newUrl) => layer.getSource().setUrl(newUrl))
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createXYZSourceForProjection()))

/**
 * Returns an OpenLayers XYZ source, with some customization depending on the projection being used.
 *
 * If the projection is a CustomCoordinateSystem, it will set the extent of this projection to a
 * dedicated TileGrid object, meaning that tiles outside the extent won't be requested.
 *
 * If the projection is not a CustomCoordinateSystem, it will default to a worldwide coverage,
 * meaning no limit where tiles shouldn't be requested.
 *
 * @returns {XYZ}
 */
function createXYZSourceForProjection() {
    let tileGrid = null
    if (projection.value instanceof CustomCoordinateSystem) {
        tileGrid = new TileGrid({
            resolutions: projection.value.getResolutions(),
            extent: projection.value.bounds.flatten,
            origin: projection.value.getTileOrigin(),
        })
    }
    return new XYZSource({
        projection: projection.value.epsg,
        url: url.value,
        tileGrid,
    })
}
</script>

<template>
    <slot />
</template>
