<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, watch } from 'vue'

import type { GeoAdminWMTSLayer } from '@swissgeo/layers'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'
import { getTimestampFromConfig, getWmtsXyzUrl } from '@swissgeo/layers/utils'
import { indexOfMaxResolution } from '@/utils/layerUtils'

interface Props {
    wmtsLayerConfig: GeoAdminWMTSLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

// mapping relevant store values
const positionStore = usePositionStore()
const mapStore = useMapStore()
const projection = computed(() => positionStore.projection)
const printMode = computed(() => mapStore.printMode)
// extracting useful info from what we've linked so far
const layerId = computed(() => props.wmtsLayerConfig.technicalName)
const maxResolution = computed(() => props.wmtsLayerConfig.maxResolution)
const opacity = computed(() => props.parentLayerOpacity ?? props.wmtsLayerConfig.opacity)
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => getTimestampFromConfig(props.wmtsLayerConfig))
const wmtsSourceConfig = computed(() => {
    return {
        // No local cache, so that our CloudFront cache is always used. Was creating an issue on mf-geoadmin3, see :
        // https://github.com/geoadmin/mf-geoadmin3/issues/3491
        cacheSize: 0,
        layer: layerId.value || '',
        format: props.wmtsLayerConfig.format,
        projection: projection.value.epsg,
        tileGrid: createTileGridForProjection(),
        url: getTransformedXYZUrl(),
        matrixSet: projection.value.epsg,
        attributions: props.wmtsLayerConfig.attributions.map(attr => attr.name),
        style: 'default',
        // so that XYZ values will be filled as TileCol, TileRow and TileMatrix in the URL (see getWMTSUrl below)
        requestEncoding: 'REST' as const,
    }
})
const wmtsTimeConfig = computed(() => {
    return { dimensions: { Time: timestamp.value } }
})

const layer = new TileLayer({
    properties: {
        id: layerId.value,
        uuid: props.wmtsLayerConfig.uuid,
    },
    opacity: opacity.value,
    source: createWMTSSourceForProjection(),
})

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

// reacting to changes accordingly
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(projection, () => layer.setSource(createWMTSSourceForProjection()))
watch(wmtsSourceConfig, () => layer.setSource(createWMTSSourceForProjection()), { deep: true })
watch(wmtsTimeConfig, () => {
    log.debug('Update wmts dimension', wmtsTimeConfig.value)
    const source = layer.getSource()
    if (source) {
        source.updateDimensions(wmtsTimeConfig.value.dimensions)
    }
})
watch(printMode, () => layer.setSource(createWMTSSourceForProjection()))

function getTransformedXYZUrl(): string {
    // @ts-expect-error - projection.value is guaranteed to be defined in this context
    return getWmtsXyzUrl(props.wmtsLayerConfig, projection.value)
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
}

/** @returns The tile grid system for the wmts source */
function createTileGridForProjection(): WMTSTileGrid {
    const maxResolutionIndex = indexOfMaxResolution(projection.value, maxResolution.value)
    let resolutionSteps = projection.value.getResolutionSteps()
    if (resolutionSteps.length > maxResolutionIndex) {
        resolutionSteps = resolutionSteps.slice(0, maxResolutionIndex + 1)
    }
    return new WMTSTileGrid({
        resolutions: resolutionSteps.map((step) => step.resolution),
        origin: projection.value.getTileOrigin(),
        matrixIds: resolutionSteps.map((_, index) => index.toString()),
        extent: projection.value.bounds?.flatten,
    })
}

/**
 * Returns an OpenLayers WMTS source, with some customization depending on the projection being
 * used.
 *
 * If the projection is a CustomCoordinateSystem, it will set the extent of this projection to a
 * dedicated TileGrid object, meaning that tiles outside the extent won't be requested.
 *
 * If the projection is not a CustomCoordinateSystem, it will default to a worldwide coverage,
 * meaning no limit where tiles shouldn't be requested.
 */
function createWMTSSourceForProjection(): WMTSSource {
    log.debug('Create new WMTS source for projection', wmtsSourceConfig.value, wmtsTimeConfig.value)
    return new WMTSSource({
        ...wmtsSourceConfig.value,
        ...wmtsTimeConfig.value,
        // loading the next zoom tiles when in print mode
        // (and standing in a floating zoom level below 0.5. e.g., z=5.2 will load z=6 tiles)
        zDirection: printMode.value ? -1 : 0,
    })
}
</script>

<template>
    <slot />
</template>
