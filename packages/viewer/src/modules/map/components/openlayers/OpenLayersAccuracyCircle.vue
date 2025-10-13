<script setup lang="ts">
/**
 * Component managing the rendering of a red transparent circle to show currently how accurate is
 * the geolocation
 */

import Feature from 'ol/Feature'
import { Circle } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { v4 as uuidv4 } from 'uuid'
import { computed, inject, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { geolocationAccuracyCircleStyle } from '@/utils/styleUtils'
import useGeolocationStore from '@/store/modules/geolocation.store'

const { zIndex } = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
})

// mapping relevant store values
const geolocationStore = useGeolocationStore()
const position = computed(() => geolocationStore.position)
const accuracy = computed(() => geolocationStore.accuracy)

if (position.value) {
    const accuracyCircle = new Circle(position.value, accuracy.value)
    const accuracyCircleFeature = new Feature({
        geometry: accuracyCircle,
    })

    accuracyCircleFeature.setStyle(geolocationAccuracyCircleStyle)

    const layer = new VectorLayer({
        properties: {
            id: `geolocation-accuracy-layer`,
            uuid: uuidv4(),
        },
        source: new VectorSource({
            features: [accuracyCircleFeature],
        }),
    })

    // grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
    const olMap = inject('olMap', null)
    if (olMap) {
        useAddLayerToMap(layer, olMap, zIndex)
    }

    // reacting to changes accordingly
    watch(position, (newPosition) => accuracyCircle.setCenter(newPosition!))
    watch(accuracy, (newAccuracy) => accuracyCircle.setRadius(newAccuracy))
}
</script>

<template>
    <slot />
</template>
