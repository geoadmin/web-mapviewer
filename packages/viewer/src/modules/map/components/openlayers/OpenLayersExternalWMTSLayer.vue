<script setup lang="ts">
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import type { Map } from 'ol'
import type { ExternalWMTSLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { Tile as TileLayer } from 'ol/layer'
import type { Options as WMTSOptions } from 'ol/source/WMTS'
import WMTS from 'ol/source/WMTS'
import { computed, inject, onMounted, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position.store'
import { timeConfigUtils } from '@swissgeo/layers/utils'

const {
    externalWmtsLayerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    externalWmtsLayerConfig: ExternalWMTSLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

const positionStore = usePositionStore()

// extracting useful info from what we've linked so far
const opacity = computed(() => parentLayerOpacity ?? externalWmtsLayerConfig.opacity)
const options = computed<WMTSOptions | undefined>(() => {
    if (!externalWmtsLayerConfig.options) {
        return undefined
    }
    const clonedOptions: WMTSOptions = cloneDeep(externalWmtsLayerConfig.options)
    if ('dimension' in clonedOptions) {
        delete clonedOptions.dimensions
    }
    return clonedOptions
})
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => timeConfigUtils.getTimestampFromConfig(externalWmtsLayerConfig))
const dimensions = computed(() => {
    if (!options.value?.dimensions) {
        return undefined
    }
    // TODO: This needs some typing and fixing
    const clonedDimensions = cloneDeep(options.value.dimensions)
    if (timestamp.value) {
        const timeDimension = Object.entries(clonedDimensions).find(
            (e) => e[0].toLowerCase() === 'time'
        )
        if (timeDimension) {
            clonedDimensions[timeDimension[0]] = timestamp.value
        } else if ('Time' in clonedDimensions) {
            clonedDimensions.Time = timestamp.value
        }
    }
    return clonedDimensions
})

const layer = new TileLayer({
    properties: {
        id: externalWmtsLayerConfig.id,
        uuid: externalWmtsLayerConfig.uuid,
    },
    opacity: opacity.value,
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

useAddLayerToMap(layer, olMap, zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(() => positionStore.projection, setSourceForProjection)
watch(options, setSourceForProjection)
watch(dimensions, () => {
    if (dimensions.value !== undefined) {
        log.debug('Update wmts dimension', dimensions.value)
        const source = layer.getSource()
        if (source && source instanceof WMTS) {
            source.updateDimensions(dimensions.value)
        }
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
function setSourceForProjection(): void {
    if (options.value && options.value.tileGrid) {
        log.debug(
            `Set WMTS source for layer ${externalWmtsLayerConfig.id} with options ${JSON.stringify(options.value)}`
        )
        // finally setting the source with the options drawn from the getCapabilities helper function
        // the layer might be shown on the map a little later than all the others because of that
        layer.setSource(new WMTS({ ...options.value, dimensions: dimensions.value }))
    } else {
        log.debug(`No WMTS options for layer ${externalWmtsLayerConfig.id} available yet`)
    }
}
</script>

<template>
    <slot />
</template>
