<script setup>
/** Component managing the rendering of a vision cone, in the direction the device is pointing at */

import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import { DEVICE_PIXEL_RATIO } from 'ol/has'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const { zIndex, effectiveHeading } = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
    effectiveHeading: {
        type: Number,
        default: null,
    },
})
const store = useStore()

const geolocationPosition = computed(() => store.state.geolocation.position)
// CSS angle context differ from the effective heading therefore we have to turn of PI/2 (90°)
// Also we need to inverse the cone and its rotation (-1 factor)
const coneAngle = computed(() => -1 * (effectiveHeading + Math.PI / 2))

const visionConeGeometry = new Point(geolocationPosition.value)
const visionConeFeature = new Feature({
    geometry: visionConeGeometry,
})
const coneSize = 50 * DEVICE_PIXEL_RATIO // px
visionConeFeature.setStyle(
    new Style({
        renderer(coordinates, state) {
            const [x, y] = coordinates
            const ctx = state.context

            const innerRadius = 0
            const outerRadius = coneSize * 1.4

            const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius)
            gradient.addColorStop(0, 'red')
            gradient.addColorStop(0.2, 'red')
            gradient.addColorStop(0.7, 'transparent')
            gradient.addColorStop(1, 'transparent')

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x, y)
            ctx.arc(x, y, coneSize, coneAngle.value - 1, coneAngle.value + 1)
            ctx.lineTo(x, y)
            ctx.fillStyle = gradient
            ctx.fill()
        },
    })
)

const layer = new VectorLayer({
    id: `vision-cone-layer`,
    source: new VectorSource({
        features: [visionConeFeature],
    }),
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, () => zIndex)

watch(geolocationPosition, () => visionConeGeometry.setCoordinates(geolocationPosition.value))
watch(() => effectiveHeading, rotateConeOnCompassHeading)

function rotateConeOnCompassHeading() {
    visionConeGeometry.rotate(effectiveHeading, geolocationPosition.value)
}
</script>

<template>
    <slot />
</template>
