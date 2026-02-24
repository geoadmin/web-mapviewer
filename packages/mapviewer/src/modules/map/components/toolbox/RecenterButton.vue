<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'RecenterButton.vue' }

const geolocationStore = useGeolocationStore()
const positionStore = usePositionStore()
const { t } = useI18n()

// Show recenter button when geolocation is active but not tracking
const showRecenterButton = computed(() => {
    return (
        geolocationStore.active &&
        geolocationStore.position !== undefined &&
        !geolocationStore.tracking
    )
})

// Tooltip always shows "re-center map" since button is hidden when tracking
const tooltipContent = 're_center_map'

function toggleTracking(): void {
    // Toggle tracking mode
    const newTrackingState = !geolocationStore.tracking
    geolocationStore.setGeolocationTracking(newTrackingState, dispatcher)

    // If enabling tracking and device has orientation, enable auto-rotation
    if (newTrackingState && positionStore.hasOrientation) {
        positionStore.setAutoRotation(true, dispatcher)
    } else if (!newTrackingState) {
        // If disabling tracking, also disable auto-rotation and reset rotation
        if (positionStore.autoRotation) {
            positionStore.setRotation(0, dispatcher)
            positionStore.setAutoRotation(false, dispatcher)
        }
    }
}
</script>

<template>
    <GeoadminTooltip
        v-if="showRecenterButton"
        placement="left"
        :tooltip-content="t(tooltipContent)"
    >
        <button
            class="toolbox-button d-print-none"
            data-cy="recenter-button"
            type="button"
            @click="toggleTracking"
        >
            <FontAwesomeIcon
                icon="arrows-to-circle"
                transform="shrink-2"
            />
        </button>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
