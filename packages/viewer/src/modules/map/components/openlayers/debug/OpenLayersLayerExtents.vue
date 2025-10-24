<script setup lang="ts">
import type { Map } from 'ol'

import { LV95 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'
import { computed, inject, toRef, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

const { zIndex = -1 } = defineProps<{
    zIndex?: number
}>()

const positionStore = usePositionStore()
const layersStore = useLayersStore()
const allLayers = computed(() => {
    const layers = []
    if (layersStore.currentBackgroundLayer) {
        layers.push(layersStore.currentBackgroundLayer)
    }
    layers.push(...layersStore.visibleLayers)
    return layers
})

const layer = new VectorLayer({
    source: createVectorSourceForProjection(),
    style: (feature) => {
        // using a random color for each extent
        // https://css-tricks.com/snippets/javascript/random-hex-color/
        const randomColor = `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0')}`
        return new Style({
            stroke: new Stroke({
                color: randomColor,
                width: 4,
            }),
            text: new Text({
                font: 'bold 16px sans-serif',
                text: feature.get('name'),
                fill: new Fill({
                    color: randomColor,
                }),
                stroke: new Stroke({
                    color: 'black',
                    width: 3,
                }),
                placement: 'line',
                overflow: true,
                offsetY: 16,
            }),
        })
    },
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}
useAddLayerToMap(
    layer,
    olMap,
    toRef(() => zIndex)
)

watch(
    () => positionStore.projection,
    () => layer.setSource(createVectorSourceForProjection())
)
watch(allLayers, () => layer.setSource(createVectorSourceForProjection()))

function createFeaturesForEachLayerExtent(): Feature[] {
    const extents: Feature[] = []
    if (allLayers.value.some((layer) => layer.constructor.name === 'GeoAdminLayer')) {
        const bounds = LV95.getBoundsAs(positionStore.projection)
        if (bounds) {
            extents.push(
                new Feature({
                    geometry: new Polygon([
                        [
                            [bounds.lowerX, bounds.lowerY],
                            [bounds.upperX, bounds.lowerY],
                            [bounds.upperX, bounds.upperY],
                            [bounds.lowerX, bounds.upperY],
                            [bounds.lowerX, bounds.lowerY],
                        ],
                    ]),
                    name: 'LV95',
                })
            )
        }
    }
    allLayers.value
        .filter(
            (layer) =>
                layer.constructor.name === 'ExternalLayer' && 'extent' in layer && !!layer.extent
        )
        .forEach((layer) => {
            if (
                'extent' in layer &&
                layer.extent &&
                Array.isArray(layer.extent) &&
                layer.extent.length === 4
            ) {
                const [minX, minY, maxX, maxY] = layer.extent as [number, number, number, number]
                extents.push(
                    new Feature({
                        geometry: new Polygon([
                            [
                                [maxX, maxY],
                                [maxX, minY],
                                [minX, minY],
                                [minX, maxY],
                                [maxX, maxY],
                            ],
                        ]),
                        name: layer.id,
                    })
                )
            }
        })
    return extents
}

function createVectorSourceForProjection(): VectorSource {
    return new VectorSource({
        features: createFeaturesForEachLayerExtent(),
    })
}
</script>

<template>
    <slot />
</template>
