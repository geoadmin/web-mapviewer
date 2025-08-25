<script setup>
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import log from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { Tile as TileLayer } from 'ol/layer'
import WMTS from 'ol/source/WMTS'
import { computed, inject, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const { externalWmtsLayerConfig, parentLayerOpacity, zIndex } = defineProps({
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

// mapping relevant store values
const store = useStore()
const projection = computed(() => store.state.position.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => externalWmtsLayerConfig.id)
const opacity = computed(() => parentLayerOpacity ?? externalWmtsLayerConfig.opacity)
const options = computed(() => {
    if (!externalWmtsLayerConfig.options) {
        return null
    }
    const _options = cloneDeep(externalWmtsLayerConfig.options)
    if (Object.hasOwn(_options, 'dimensions')) {
        delete _options.dimensions
    }
    return _options
})
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => getTimestampFromConfig(externalWmtsLayerConfig))
const dimensions = computed(() => {
    if (!options.value) {
        return null
    }
    const _dimensions = cloneDeep(options.value?.dimensions ?? {})
    if (timestamp.value) {
        const timeDimension = Object.entries(_dimensions).find((e) => e[0].toLowerCase() === 'time')
        if (timeDimension) {
            _dimensions[timeDimension[0]] = timestamp.value
        } else {
            _dimensions.Time = timestamp.value
        }
    }
    return _dimensions
})

const layer = new TileLayer({
    id: layerId.value,
    uuid: externalWmtsLayerConfig.uuid,
    opacity: opacity.value,
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, () => zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, setSourceForProjection)
watch(options, setSourceForProjection)
watch(dimensions, () => {
    if (dimensions.value !== null) {
        log.debug('Update wmts dimension', dimensions.value)
        layer.getSource().updateDimensions(dimensions.value)
    }
})

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
        layer.setSource(new WMTS({ ...options.value, dimensions: dimensions.value }))
    } else {
        log.debug(`No WMTS options for layer ${layerId.value} available yet`)
    }
}
</script>

<template>
    <slot />
</template>
