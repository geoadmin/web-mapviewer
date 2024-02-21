<script setup>
/** Adds a GeoJSON layer to the OpenLayers map */

import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
import { reprojectGeoJsonData } from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

const props = defineProps({
    geoJsonConfig: {
        type: GeoAdminGeoJsonLayer,
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
const { geoJsonConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => geoJsonConfig.value.serverLayerId)
const opacity = computed(() => parentLayerOpacity.value || geoJsonConfig.value.opacity)
const geoJsonData = computed(() => geoJsonConfig.value.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.value.geoJsonStyle)
const isLoading = computed(() => geoJsonConfig.value.isLoading)

const layer = new VectorLayer({ id: layerId.value, opacity: opacity.value })

function createSourceForProjection() {
    if (!geoJsonData.value) {
        log.debug('no GeoJSON data loaded yet, could not create source')
        return
    }
    if (!geoJsonStyle.value) {
        log.debug('style was not loaded, could not create source')
        return
    }
    // if the GeoJSON describes a CRS (projection) we grab it so that we can reproject on the fly if needed
    const matchingDataProjection = allCoordinateSystems.find(
        (coordinateSystem) => coordinateSystem.epsg === geoJsonData.value?.crs?.properties?.name
    )
    const styleFunction = new OlStyleForPropertyValue(geoJsonStyle.value)
    layer.setStyle((feature, res) => styleFunction.getFeatureStyle(feature, res))
    layer.setSource(
        new VectorSource({
            features: new GeoJSON().readFeatures(
                reprojectGeoJsonData(geoJsonData.value, projection.value, matchingDataProjection)
            ),
        })
    )
}

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, zIndex)

createSourceForProjection()

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(isLoading, createSourceForProjection)
</script>

<template>
    <slot />
</template>
