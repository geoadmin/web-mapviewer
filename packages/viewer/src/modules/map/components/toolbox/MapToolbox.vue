<script setup lang="ts">
import { computed } from 'vue'
import useUiStore from '@/store/modules/ui.store'
import FullScreenButton from './FullScreenButton.vue'
import GeolocButton from './GeolocButton.vue'
import ZoomButtons from './ZoomButtons.vue'
import Toggle3dButton from './Toggle3dButton.vue'
import TimeSliderButton from './TimeSliderButton.vue'

const uiStore = useUiStore()

const isToolboxVisible = computed(() => !uiStore.fullscreenMode)
</script>

<template>
    <div
        v-if="isToolboxVisible"
        class="map-toolbox d-print-none"
    >
        <FullScreenButton />
        <GeolocButton />
        <ZoomButtons />
        <Toggle3dButton />
        <TimeSliderButton />
    </div>
</template>

<style lang="scss" scoped>
.map-toolbox {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1000;
}
</style>
