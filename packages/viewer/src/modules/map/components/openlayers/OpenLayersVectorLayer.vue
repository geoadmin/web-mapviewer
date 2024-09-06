<script setup lang="js">
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
import { VectorTile as VectorTileSource } from 'ol/source'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import GeoAdminVectorLayer from '@/api/layers/GeoAdminVectorLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const { vectorLayerConfig, parentLayerOpacity, zIndex } = defineProps({
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

const store = useStore()
const currentProjection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => vectorLayerConfig.vectorStyleId)
const opacity = computed(() => parentLayerOpacity ?? vectorLayerConfig.opacity)
const styleUrl = computed(() => `${vectorLayerConfig.baseUrl}styles/${layerId.value}/style.json`)

const layer = new MapLibreLayer({
    id: layerId.value,
    uuid: vectorLayerConfig.uuid,
    opacity: opacity.value,
    mapLibreOptions: {
        style: styleUrl.value,
    },
    source: new VectorTileSource({
        attribution: [vectorLayerConfig.attribution],
    }),
    translateZoom: (zoom) => {
        if (!currentProjection.value.usesMercatorPyramid) {
            return currentProjection.value.transformCustomZoomLevelToStandard(zoom)
        }
        return zoom
    },
})

const olMap = inject('olMap')
useAddLayerToMap(layer, olMap, () => zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(styleUrl, (newStyleUrl) => layer.mapLibreMap?.setStyle(newStyleUrl))
</script>

<template>
    <slot />
</template>
