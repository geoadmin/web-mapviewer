<script setup lang="ts">
/**
 * Component managing the rendering of a red transparent circle to show currently how accurate is
 * the geolocation
 */

import type { Map } from 'ol'
import type { Coordinate } from 'ol/coordinate'

import log from '@swissgeo/log'
import Feature from 'ol/Feature'
import { Circle } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { v4 as uuidv4 } from 'uuid'
import { computed, inject, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import useGeolocationStore from '@/store/modules/geolocation'
import { geolocationAccuracyCircleStyle } from '@/utils/styleUtils'

const { zIndex = -1 } = defineProps<{
    zIndex?: number
}>()

// mapping relevant store values
const geolocationStore = useGeolocationStore()
const position = computed(() => geolocationStore.position)
const accuracy = computed(() => geolocationStore.accuracy)

if (position.value) {
    const accuracyCircle = new Circle(position.value as Coordinate, accuracy.value)
    const accuracyCircleFeature = new Feature({
        geometry: accuracyCircle,
    })

    accuracyCircleFeature.setStyle(geolocationAccuracyCircleStyle)

    const layer = new VectorLayer({
        properties: {
            id: 'geolocation-accuracy-layer',
            uuid: uuidv4(),
        },
        source: new VectorSource({
            features: [accuracyCircleFeature],
        }),
    })

    // grabbing the map from the main OpenLayersMap component and use the composable that adds this layer to the map
    const olMap = inject<Map>('olMap')
    if (!olMap) {
        log.error('OpenLayersMap is not available')
        throw new Error('OpenLayersMap is not available')
    }
    useAddLayerToMap(layer, olMap, () => zIndex)

    // reacting to changes accordingly
    watch(position, (newPosition) => {
        if (newPosition) {
            accuracyCircle.setCenter(newPosition as Coordinate)
        }
    })
    watch(accuracy, (newAccuracy: number) => accuracyCircle.setRadius(newAccuracy))
}
</script>

<template>
    <slot />
</template>
