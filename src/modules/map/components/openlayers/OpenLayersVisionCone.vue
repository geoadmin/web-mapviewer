<script setup>
/** Component managing the rendering of a vision cone, in the direction the device is pointing at */

import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import { DEVICE_PIXEL_RATIO } from 'ol/has'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import { computed, inject, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

const props = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { zIndex } = toRefs(props)

const store = useStore()

const headingOffset = ref(0)
const effectiveHeading = ref(0)
let headingIsAbsolute = false
let visionInterval = null

const geolocationPosition = computed(() => store.state.geolocation.position)
const geolocationHeading = computed(() => store.state.geolocation.heading)
const positionHeading = computed(() => store.state.position.heading)
const showVisionCone = computed(() => headingIsAbsolute || geolocationHeading.value)

onMounted(() => {
    window.addEventListener('deviceorientation', getIfOrientationAbsolute)
    visionInterval = setInterval(() => {
        if (geolocationHeading.value) {
            console.error('geolocationHeading has value: ', geolocationHeading.value)
            headingOffset.value = geolocationHeading.value - positionHeading.value
        } else {
            console.error('geolocationHeading has no value: ', geolocationHeading.value)
        }
        effectiveHeading.value = -positionHeading.value - headingOffset.value - Math.PI / 2
    }, 500)
})

onUnmounted(() => {
    clearInterval(visionInterval)
})

const getIfOrientationAbsolute = function (event) {
    headingIsAbsolute = event.absolute
    window.removeEventListener('deviceorientation', getIfOrientationAbsolute)
}

function rotateConeOnCompassHeading() {
    visionConeGeometry.rotate(effectiveHeading.value, geolocationPosition.value)
}

const visionConeGeometry = new Point(geolocationPosition.value)
rotateConeOnCompassHeading()

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
            ctx.arc(x, y, coneSize, effectiveHeading.value - 1, effectiveHeading.value + 1)
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
useAddLayerToMap(layer, olMap, zIndex)

watch(geolocationPosition, () => visionConeGeometry.setCoordinates(geolocationPosition.value))
watch(effectiveHeading, rotateConeOnCompassHeading)
</script>

<template>
    <slot />
</template>
