<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { Tile as TileLayer } from 'ol/layer'
import { WMTS as WMTSSource } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { computed, inject, watch } from 'vue'

import type { GeoAdminWMTSLayer } from '@swissgeo/layers'
import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'

const {
    wmtsLayerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    wmtsLayerConfig: GeoAdminWMTSLayer
    parentLayerOpacity?: number
    zIndex?: number
}>()

// mapping relevant store values
const positionStore = usePositionStore()
const mapStore = useMapStore()

const opacity = computed(() => parentLayerOpacity ?? wmtsLayerConfig.opacity)
// Use "current" as the default timestamp if not defined in the layer config (or no preview year)
const timestamp = computed(() => timeConfigUtils.getTimestampFromConfig(wmtsLayerConfig))

const wmtsSourceConfig = computed(() => {
    return {
        // No local cache, so that our CloudFront cache is always used. Was creating an issue on mf-geoadmin3, see :
        // https://github.com/geoadmin/mf-geoadmin3/issues/3491
        cacheSize: 0,
        layer: wmtsLayerConfig.technicalName ?? '',
        format: wmtsLayerConfig.format,
        projection: positionStore.projection.epsg,
        tileGrid: createTileGridForProjection(),
        url: getTransformedXYZUrl(wmtsLayerConfig, positionStore.projection, true),
        matrixSet: positionStore.projection.epsg,
        attributions: wmtsLayerConfig.attributions.map((attr) => attr.name),
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
        id: wmtsLayerConfig.technicalName,
        uuid: wmtsLayerConfig.uuid,
    },
    opacity: opacity.value,
    source: createWMTSSourceForProjection(),
})

// grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
const olMap = inject<Map>('olMap')
if (olMap) {
    useAddLayerToMap(layer, olMap, zIndex)
}

// reacting to changes accordingly
watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(
    () => positionStore.projection,
    () => layer.setSource(createWMTSSourceForProjection())
)
watch(wmtsSourceConfig, () => layer.setSource(createWMTSSourceForProjection()), { deep: true })
watch(wmtsTimeConfig, () => {
    log.debug('Update wmts dimension', wmtsTimeConfig.value)
    const source = layer.getSource()
    if (source) {
        source.updateDimensions(wmtsTimeConfig.value.dimensions)
    }
})
watch(
    () => mapStore.printMode,
    () => layer.setSource(createWMTSSourceForProjection())
)

function getTransformedXYZUrl(
    layerConfig: GeoAdminWMTSLayer | undefined,
    projection: CoordinateSystem | undefined,
    addTimestamp: boolean = true
): string {
    if (!layerConfig || !projection) {
        return ''
    }
    const url = layerUtils.getWmtsXyzUrl?.(layerConfig, projection, { addTimestamp })
    if (!url) {
        return ''
    }
    return url
        .replace('{z}', '{TileMatrix}')
        .replace('{x}', '{TileCol}')
        .replace('{y}', '{TileRow}')
}

/**
 * Returns the index of the max resolution, which is used to determine the maximum zoom level
 * default to the array length
 */
function indexOfMaxResolution(projection: CoordinateSystem, layerMaxResolution: number): number {
    const resolutionSteps = projection.getResolutionSteps()
    const matchResolutionStep = resolutionSteps.find(
        (step) => step.resolution === layerMaxResolution
    )
    if (!matchResolutionStep) {
        return resolutionSteps.length - 1
    }
    return resolutionSteps.indexOf(matchResolutionStep)
}

/** @returns The tile grid system for the wmts source */
function createTileGridForProjection(): WMTSTileGrid {
    const maxResolutionIndex = indexOfMaxResolution(
        positionStore.projection,
        wmtsLayerConfig.maxResolution
    )
    let resolutionSteps = positionStore.projection.getResolutionSteps()
    if (resolutionSteps.length > maxResolutionIndex) {
        resolutionSteps = resolutionSteps.slice(0, maxResolutionIndex + 1)
    }
    return new WMTSTileGrid({
        resolutions: resolutionSteps.map((step) => step.resolution),
        origin: positionStore.projection.getTileOrigin(),
        matrixIds: resolutionSteps.map((_, index) => index.toString()),
        extent: positionStore.projection.bounds?.flatten,
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
        zDirection: mapStore.printMode ? -1 : 0,
    })
}
</script>

<template>
    <slot />
</template>
