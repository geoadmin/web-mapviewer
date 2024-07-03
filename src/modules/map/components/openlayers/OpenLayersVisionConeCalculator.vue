<script setup>
/** Component managing the rendering of a vision cone, in the direction the device is pointing at */

import { computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import OpenLayersVisionCone from '@/modules/map/components/openlayers/OpenLayersVisionCone.vue'

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
let updatedGeolocation = 0

const geolocationHeading = computed(() => store.state.geolocation.heading)
const positionHeading = computed(() => store.state.position.heading)

onMounted(() => {
    window.addEventListener('deviceorientation', checkIfOrientationIsAbsolute)
    if (geolocationHeading.value) {
        updatedGeolocation = geolocationHeading.value
    }
    visionInterval = setInterval(() => {
        if (updatedGeolocation && !headingIsAbsolute) {
            headingOffset.value = updatedGeolocation - positionHeading.value
            updatedGeolocation = 0
        }
        effectiveHeading.value = -positionHeading.value - headingOffset.value - Math.PI / 2
    }, 200)
})

onUnmounted(() => {
    clearInterval(visionInterval)
})

const checkIfOrientationIsAbsolute = function (event) {
    headingIsAbsolute = event.absolute
    window.removeEventListener('deviceorientation', checkIfOrientationIsAbsolute)
}

watch(geolocationHeading, () => {
    if (geolocationHeading.value) {
        updatedGeolocation = geolocationHeading.value
    }
})
</script>

<template>
    <OpenLayersVisionCone
        v-if="headingIsAbsolute || geolocationHeading"
        :z-index="zIndex"
        :effective-heading="effectiveHeading"
    />
    <slot />
</template>
