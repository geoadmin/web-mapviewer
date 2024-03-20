<script setup>
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import { Tile as TileLayer } from 'ol/layer'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import { computed, inject, onMounted, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
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
const layerId = computed(() => externalWmtsLayerConfig.value.externalLayerId)
const opacity = computed(() => parentLayerOpacity.value || externalWmtsLayerConfig.value.opacity)
const getCapabilitiesUrl = computed(() => externalWmtsLayerConfig.value.baseUrl)

const wmtsGetCapParser = new WMTSCapabilities()
const layer = new TileLayer({
    id: layerId.value,
    opacity: opacity.value,
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, setSourceForProjection)

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
    // fetching getCapabilities information in order to generate a proper layer config
    fetch(getCapabilitiesUrl.value)
        // parsing as text (as OL helper function want a string as input)
        .then((response) => response.text())
        .then((textResponse) => {
            const getCapabilities = wmtsGetCapParser.read(textResponse)
            if (getCapabilities.version) {
                // filtering the whole getCap XML with the given layer ID
                const options = optionsFromCapabilities(getCapabilities, {
                    layer: layerId.value,
                    projection: projection.value.epsg,
                })
                if (options) {
                    // finally setting the source with the options drawn from the getCapabilities helper function
                    // the layer might be shown on the map a little later than all the others because of that
                    layer.setSource(new WMTS(options))
                } else {
                    log.error(
                        `Layer ${layerId.value} not found in WMTS Capabilities:`,
                        getCapabilities
                    )
                }
            } else {
                log.error(`Invalid WMTS Capabilities:`, textResponse)
            }
        })
        .catch((error) => {
            log.error(
                `Failed to fetch external WMTS layer from ${getCapabilitiesUrl.value}: ${error}`,
                error
            )
        })
}
</script>

<template>
    <slot />
</template>
