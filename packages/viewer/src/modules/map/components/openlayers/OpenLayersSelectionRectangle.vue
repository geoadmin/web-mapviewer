<script setup>
import Feature from 'ol/Feature'
import { fromExtent } from 'ol/geom/Polygon'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const { zIndex } = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
})

const store = useStore()
const currentProjection = computed(() => store.state.position.projection)
const selectionExtent = computed(() => store.state.map.rectangleSelectionExtent || [])

const layer = new VectorLayer({
    source: createVectorSourceForProjection(),
    style: new Style({
        stroke: new Stroke({
            color: 'red',
            width: 3,
        }),
    }),
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, () => zIndex)

watch(currentProjection, () => layer.setSource(createVectorSourceForProjection()))
watch(selectionExtent, () => layer.setSource(createVectorSourceForProjection()))

function createVectorSourceForProjection() {
    if (!selectionExtent.value) {
        return new VectorSource({
            projection: currentProjection.value.epsg,
        })
    } else {
        return new VectorSource({
            projection: currentProjection.value.epsg,
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
