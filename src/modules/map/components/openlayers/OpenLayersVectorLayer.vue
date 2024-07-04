<script setup>
/**
 * Renders a Vector layer on the map with MapLibre.
 *
 * This component should be heavily modified as soon as
 * https://jira.swisstopo.ch/browse/BGDIINF_SB-2741 can be done (as soon as layers config serves
 * configs for VT layers)
 *
 * Most of the specific code found bellow, plus import of layer ID should be removed then.
 */

import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer'
import { Source } from 'ol/source'
import { computed, inject, toRefs, watch } from 'vue'

import GeoAdminVectorLayer from '@/api/layers/GeoAdminVectorLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const props = defineProps({
    vectorLayerConfig: {
        type: GeoAdminVectorLayer,
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
const { vectorLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// extracting useful info from what we've linked so far
const layerId = computed(() => vectorLayerConfig.value.vectorStyleId)
const opacity = computed(() => parentLayerOpacity.value ?? vectorLayerConfig.value.opacity)
const styleUrl = computed(
    () => `${vectorLayerConfig.value.baseUrl}styles/${layerId.value}/style.json`
)

const layer = new MapLibreLayer({
    opacity: opacity.value,
    mapLibreOptions: {
        style: styleUrl.value,
    },
    source: new Source({
        attribution: [vectorLayerConfig.value.attribution],
    }),
})

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(styleUrl, (newStyleUrl) => layer.mapLibreMap?.setStyle(newStyleUrl))
</script>

<template>
    <slot />
</template>
