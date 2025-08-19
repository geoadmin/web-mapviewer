<script setup>
/** Adds a GeoJSON layer to the OpenLayers map */

import { LayerType } from '@geoadmin/layers'
import log from '@geoadmin/log'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import OlStyleForPropertyValue from '@/modules/map/components/openlayers/utils/styleFromLiterals'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { reprojectGeoJsonGeometry } from '@/utils/geoJsonUtils.js'

const { geoJsonConfig, parentLayerOpacity, zIndex } = defineProps({
    geoJsonConfig: {
        validator: (value) => value.type === LayerType.GeoJSON,
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

// extracting useful info from what we've linked so far
const layerId = computed(() => geoJsonConfig.technicalName)
const opacity = computed(() => parentLayerOpacity ?? geoJsonConfig.opacity)
const geoJsonData = computed(() => geoJsonConfig.geoJsonData)
const geoJsonStyle = computed(() => geoJsonConfig.geoJsonStyle)
const isLoading = computed(() => geoJsonConfig.isLoading)

const layer = new VectorLayer({
    id: layerId.value,
    uuid: geoJsonConfig.uuid,
    opacity: opacity.value,
})

function setGeoJsonStyle() {
    if (!geoJsonStyle.value) {
        log.debug('style was not loaded, could not create source')
        return
    }
    const styleFunction = new OlStyleForPropertyValue(geoJsonStyle.value)
    layer.setStyle((feature, res) => styleFunction.getFeatureStyle(feature, res))
}
function setFeatures() {
    if (!geoJsonData.value) {
        log.debug('no GeoJSON data loaded yet, could not create source')
        return
    }
    layer.setSource(
        new VectorSource({
            features: new GeoJSON().readFeatures(
                reprojectGeoJsonGeometry(geoJsonData.value, projection.value)
            ),
        })
    )
}

function createSourceForProjection() {
    setGeoJsonStyle()
    setFeatures()
}

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, () => zIndex)

createSourceForProjection()

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, createSourceForProjection)
watch(isLoading, createSourceForProjection)
watch(geoJsonData, setFeatures)
</script>

<template>
    <slot />
</template>
