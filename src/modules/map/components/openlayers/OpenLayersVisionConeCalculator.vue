<script setup>
/** Component managing the rendering of a vision cone, in the direction the device is pointing at */

import { computed, onMounted, onUnmounted, ref, toRefs } from 'vue'
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

const geolocationHeading = computed(() => store.state.geolocation.heading)
const positionHeading = computed(() => store.state.position.heading)
const showVisionCone = computed(() => headingIsAbsolute || true)

onMounted(() => {
    window.addEventListener('deviceorientation', checkIfOrientationIsAbsolute)
    visionInterval = setInterval(() => {
        if (geolocationHeading.value && !headingIsAbsolute) {
            headingOffset.value = geolocationHeading.value - positionHeading.value
        }
        effectiveHeading.value = -positionHeading.value - headingOffset.value - Math.PI / 2
    }, 500)
})

onUnmounted(() => {
    clearInterval(visionInterval)
})

const checkIfOrientationIsAbsolute = function (event) {
    headingIsAbsolute = event.absolute
    window.removeEventListener('deviceorientation', checkIfOrientationIsAbsolute)
}
</script>

<template>
    <OpenLayersVisionCone
        v-if="showVisionCone"
        :z-index="zIndex"
        :effective-heading="effectiveHeading"
    />
    <slot />
</template>
