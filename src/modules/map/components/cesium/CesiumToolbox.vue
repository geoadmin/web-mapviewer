<script setup>
import '@geoblocks/cesium-compass'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Ray } from 'cesium'
import { computed, inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'

const compass = ref(null)

const store = useStore()

const isDesktopMode = computed(() => store.getters.isDesktopMode)
const resolution = computed(() => store.getters.resolution)

const getViewer = inject('getViewer')

const viewer = getViewer()

onMounted(() => {
    if (viewer) {
        compass.value.scene = viewer.scene
        compass.value.clock = viewer.clock
    } else {
        log.error('No Cesium viewer found, could not link compass')
    }
})

const resolutionRatioForZoomInOut = 200
const step = computed(() => resolution.value * resolutionRatioForZoomInOut)

function moveCamera(distance) {
    const camera = viewer.scene.camera
    if (camera) {
        camera.flyTo({
            destination: Ray.getPoint(new Ray(camera.position, camera.direction), distance),
            orientation: {
                heading: camera.heading,
                pitch: camera.pitch,
                roll: camera.roll,
            },
            duration: 0.25,
        })
    }
}

function moveForward() {
    moveCamera(step.value)
}

function moveBackward() {
    moveCamera(-step.value)
}
</script>

<template>
    <div class="cesium-toolbox">
        <button class="cesium-toolbox-button" @click="moveForward">
            <FontAwesomeIcon icon="plus" />
        </button>
        <cesium-compass v-show="isDesktopMode" ref="compass" class="cesium-toolbox-compass" />
        <button class="cesium-toolbox-button" @click="moveBackward">
            <FontAwesomeIcon icon="minus" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.cesium-toolbox {
    display: flex;

    $compass-size: 95px;
    $button-size: calc($compass-size / 2);
    &-button {
        width: $button-size;
        height: $button-size;
        border-radius: calc($button-size / 2);
        border: 2px solid rgba(0, 0, 0, 0.4);
        background: rgb(224, 225, 226);
        font-size: calc($button-size / 2.5);
        color: rgba(0, 0, 0, 0.8);
    }

    &-compass {
        position: relative;
        width: $compass-size;
        height: $compass-size;
        --cesium-compass-stroke-color: rgba(0, 0, 0, 0.6);
        --cesium-compass-fill-color: rgb(224, 225, 226);
    }
}
</style>
