<script setup>
/** Component managing the computation of the vision cone, in the direction the device is pointing at */

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

const effectiveHeading = ref(0)
let headingOffset = 0
let visionInterval = null

const geolocationHeading = computed(() => store.state.geolocation.heading)
const positionHeading = computed(() => store.state.position.heading)
const headingIsAbsolute = computed(() => store.state.position.headingIsAbsolute)

onMounted(() => {
    visionInterval = setInterval(() => {
        if (headingIsAbsolute.value) {
            effectiveHeading.value = positionHeading.value + Math.PI / 2
        } else {
            effectiveHeading.value = positionHeading.value + headingOffset + Math.PI / 2
        }
    }, 200)
})

onUnmounted(() => {
    clearInterval(visionInterval)
})

watch(geolocationHeading, () => {
    //take heading of geolocation as reference for relative device orientation
    if (geolocationHeading.value) {
        headingOffset = geolocationHeading.value - positionHeading.value
    }
})
</script>

<template>
    <OpenLayersVisionCone
        v-if="headingIsAbsolute || geolocationHeading || true"
        :z-index="zIndex"
        :effective-heading="-effectiveHeading"
    />
    <slot />
</template>
