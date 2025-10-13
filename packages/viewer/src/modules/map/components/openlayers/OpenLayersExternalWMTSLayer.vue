<script setup lang="ts">
/** Renders a WMTS layer on the map by configuring it through a getCapabilities XML file */

import type { Map } from 'ol'
import type { ExternalWMTSLayer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { Tile as TileLayer } from 'ol/layer'
import WMTS from 'ol/source/WMTS'
import { computed, inject, onMounted, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position.store'
import { getTimestampFromConfig } from '@swissgeo/layers/utils'

interface Props {
    externalWmtsLayerConfig: ExternalWMTSLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

// mapping relevant store values
const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)

// extracting useful info from what we've linked so far
const layerId = computed(() => props.externalWmtsLayerConfig.id)
const opacity = computed(() => props.parentLayerOpacity ?? props.externalWmtsLayerConfig.opacity)
const options = computed(() => {
    if (!props.externalWmtsLayerConfig.options) {
        return undefined
    }
    const _options = cloneDeep(props.externalWmtsLayerConfig.options)
    if (Object.hasOwn(_options, 'dimensions')) {
        delete _options.dimensions
    }
    return _options
})
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => getTimestampFromConfig(props.externalWmtsLayerConfig))
const dimensions = computed(() => {
    if (!options.value) {
        return undefined
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
    properties: {
        id: layerId.value,
        uuid: props.externalWmtsLayerConfig.uuid,
    },
    opacity: opacity.value,
})

const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, setSourceForProjection)
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
            `Set WMTS source for layer ${layerId.value} with options ${JSON.stringify(options.value)}`
        )
        // finally setting the source with the options drawn from the getCapabilities helper function
        // the layer might be shown on the map a little later than all the others because of that
        // @ts-expect-error - tileGrid is guaranteed to be defined due to the guard above
        layer.setSource(new WMTS({ ...options.value, dimensions: dimensions.value }))
    } else {
        log.debug(`No WMTS options for layer ${layerId.value} available yet`)
    }
}
</script>

<template>
    <slot />
</template>
