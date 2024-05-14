<script setup>
import '@geoblocks/cesium-compass'

import { computed, inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'

const compass = ref(null)

const store = useStore()

const isDesktopMode = computed(() => store.getters.isDesktopMode)

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
</script>

<template>
    <div class="cesium-toolbox">
        <cesium-compass v-show="isDesktopMode" ref="compass" class="cesium-toolbox-compass" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.cesium-toolbox {
    display: flex;

    $compass-size: 95px;

    &-compass {
        position: relative;
        width: $compass-size;
        height: $compass-size;
        --cesium-compass-stroke-color: rgba(0, 0, 0, 0.6);
        --cesium-compass-fill-color: rgb(224, 225, 226);
    }
}
</style>
