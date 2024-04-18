<script setup>
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import { Tile as TileLayer } from 'ol/layer'
import WMTS from 'ol/source/WMTS'
import { computed, inject, onMounted, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import log from '@/utils/logging'

const props = defineProps({
    externalWmtsLayerConfig: {
        type: ExternalWMTSLayer,
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
const { externalWmtsLayerConfig, parentLayerOpacity, zIndex } = toRefs(props)

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => externalWmtsLayerConfig.value.id)
const opacity = computed(() => parentLayerOpacity.value ?? externalWmtsLayerConfig.value.opacity)
const options = computed(() => externalWmtsLayerConfig.value.options)

const layer = new TileLayer({
    id: layerId.value,
    opacity: opacity.value,
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, setSourceForProjection)
watch(options, setSourceForProjection)

onMounted(() => {
    setSourceForProjection()
})

/**
 * Requests the getCapabilities from this layer and build the relevant source, according to the
 * current projection.
 *
 * Will set this source to the layer, asynchronously (when it's received the getCap and has parsed
 * it)
 */
function setSourceForProjection() {
    if (options.value) {
        log.debug(
            `Set WMTS source for layer ${layerId.value} with options ${JSON.stringify(options.value)}`
        )
        // finally setting the source with the options drawn from the getCapabilities helper function
        // the layer might be shown on the map a little later than all the others because of that
        layer.setSource(new WMTS(options.value))
    } else {
        log.debug(`No WMTS options for layer ${layerId.value} available yet`)
    }
}
</script>

<template>
    <slot />
</template>
