<script setup>
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import { Tile as TileLayer } from 'ol/layer'
import WMTS from 'ol/source/WMTS'
import { computed, inject, onMounted, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { getTimestampFromConfig } from '@/utils/layerUtils'
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
const previewYear = computed(() => store.state.layers.previewYear)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

// extracting useful info from what we've linked so far
const layerId = computed(() => externalWmtsLayerConfig.value.id)
const opacity = computed(() => parentLayerOpacity.value ?? externalWmtsLayerConfig.value.opacity)
const options = computed(() => {
    const options = { ...externalWmtsLayerConfig.value.options }
    options.dimensions = { ...options.dimensions }
    if (timestamp.value) {
        const timeDimension = Object.entries(options.dimensions ?? {}).find(
            (e) => e[0].toLowerCase() === 'time'
        )
        if (timeDimension) {
            options.dimensions[timeDimension[0]] = timestamp.value
        } else {
            if (!options.dimensions) {
                options.dimensions = {}
            }
            options.dimensions.Time = timestamp.value
        }
    }
    return options
})
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(
    () =>
        getTimestampFromConfig(
            externalWmtsLayerConfig.value,
            previewYear.value,
            isTimeSliderActive.value
        ) ?? 'current'
)

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
