<script setup lang="ts">
import type { Map } from 'ol'
import type { FlatExtent } from '@swissgeo/coordinates'

import log from '@swissgeo/log'
import Feature from 'ol/Feature'
import { fromExtent } from 'ol/geom/Polygon'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'
import { inject, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'

const { zIndex = -1 } = defineProps<{
    zIndex?: number
}>()

const positionStore = usePositionStore()
const mapStore = useMapStore()

const layer = new VectorLayer({
    source: createVectorSourceForProjection(),
    style: new Style({
        stroke: new Stroke({
            color: 'red',
            width: 3,
        }),
    }),
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}
useAddLayerToMap(layer, olMap, zIndex)

watch(
    () => positionStore.projection,
    () => layer.setSource(createVectorSourceForProjection())
)
watch(
    () => mapStore.rectangleSelectionExtent,
    () => layer.setSource(createVectorSourceForProjection())
)

function createVectorSourceForProjection(): VectorSource {
    const extent: FlatExtent | undefined = mapStore.rectangleSelectionExtent
    if (!extent) {
        return new VectorSource()
    } else {
        return new VectorSource({
            features: [
                new Feature({
                    geometry: fromExtent(extent),
                    name: 'Rectangle Selection',
                }),
            ],
        })
    }
}
</script>

<template>
    <slot />
</template>
