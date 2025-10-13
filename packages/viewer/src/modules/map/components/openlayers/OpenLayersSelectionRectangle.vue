<script setup lang="ts">
import type { Map } from 'ol'

import Feature from 'ol/Feature'
import { fromExtent } from 'ol/geom/Polygon'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'
import { computed, inject, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'

interface Props {
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    zIndex: -1,
})

const positionStore = usePositionStore()
const mapStore = useMapStore()

const currentProjection = computed(() => positionStore.projection)
const selectionExtent = computed(() => mapStore.rectangleSelectionExtent ?? [])

const layer = new VectorLayer({
    source: createVectorSourceForProjection(),
    style: new Style({
        stroke: new Stroke({
            color: 'red',
            width: 3,
        }),
    }),
})

const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

watch(currentProjection, () => layer.setSource(createVectorSourceForProjection()))
watch(selectionExtent, () => layer.setSource(createVectorSourceForProjection()))

function createVectorSourceForProjection(): VectorSource {
    if (!selectionExtent.value || selectionExtent.value.length === 0) {
        return new VectorSource()
    } else {
        return new VectorSource({
            features: [
                new Feature({
                    geometry: fromExtent(selectionExtent.value),
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
