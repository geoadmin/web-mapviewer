<script setup>
import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {  Stroke, Style } from 'ol/style'
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
const selectionRectangleCoordinates = computed(() => store.state.features.selectionRectangleCoordinates)

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
watch(selectionRectangleCoordinates, () => layer.setSource(createVectorSourceForProjection()))

function createVectorSourceForProjection() {
    console.log('Creating vector source for rectangle selection with coordinates:', selectionRectangleCoordinates.value)
    if(!selectionRectangleCoordinates.value || selectionRectangleCoordinates.value.length === 0) {
        return new VectorSource({
            projection: currentProjection.value.epsg,
        })
    } else {
        const sr = new VectorSource({
            projection: currentProjection.value.epsg,
            features: [new Feature({
                geometry: new Polygon(selectionRectangleCoordinates.value),
                name: 'Rectangle Selection',
            })],
        })
        window.sr = sr
        console.log('Selection rectangle polygon:', sr)
        return sr
    }
}
</script>

<template>
    <slot />
</template>
