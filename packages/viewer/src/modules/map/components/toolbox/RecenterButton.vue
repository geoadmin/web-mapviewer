<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'RecenterButton.vue' }

const geolocationStore = useGeolocationStore()
const positionStore = usePositionStore()
const { t } = useI18n()

// Show recenter button only when: geolocation is active AND map center is >1m away from user's location
const showRecenterButton = computed(() => {
    if (!geolocationStore.active || !geolocationStore.position) {
        return false
    }

    // Check if map center is different from user's location
    const [userX, userY] = geolocationStore.position
    const [centerX, centerY] = positionStore.center

    // Use a small threshold to account for floating point precision
    // and minor position changes that wouldn't be noticeable to the user
    const threshold = 1 // 1 meter tolerance
    const distanceX = Math.abs(userX - centerX)
    const distanceY = Math.abs(userY - centerY)

    return distanceX > threshold || distanceY > threshold
})

function recenterMap(): void {
    // Just recenter the map to user's position (one-time), don't enable tracking
    if (geolocationStore.position) {
        positionStore.setCenter(geolocationStore.position, dispatcher)
    }
}
</script>

<template>
    <button
        v-if="showRecenterButton"
        class="toolbox-button d-print-none"
        data-cy="recenter-button"
        type="button"
        :title="t('re_center_map')"
        @click="recenterMap"
    >
        <FontAwesomeIcon
            icon="location-crosshairs"
            transform="shrink-2"
        />
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
