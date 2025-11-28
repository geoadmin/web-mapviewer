<script setup lang="ts">
import type { Map } from 'ol'
import type MapEvent from 'ol/MapEvent'

const RESET_ANIMATION_DURATION_MS = 300

import log from '@swissgeo/log'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'OpenLayersCompassButton.vue' }

const { hideIfNorth = false } = defineProps<{
    hideIfNorth?: boolean
}>()

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

const positionStore = usePositionStore()
const { t } = useI18n()

const rotation = ref(0)
const isResetting = ref(false)
const showCompass = computed(() => Math.abs(rotation.value) >= 1e-9 || !hideIfNorth)

onMounted(() => {
    olMap.on('postrender', onRotate)
})

onUnmounted(() => {
    olMap.un('postrender', onRotate)
})

function resetRotation(): void {
    isResetting.value = true
    positionStore.setAutoRotation(false, dispatcher)
    positionStore.setRotation(0, dispatcher)
    rotation.value = 0
    // Allow rotation updates again after animation completes
    setTimeout(() => {
        isResetting.value = false
    }, RESET_ANIMATION_DURATION_MS)
}

function onRotate(mapEvent: MapEvent): void {
    // Ignore rotation updates during reset animation to prevent button from reappearing
    if (isResetting.value) {
        return
    }
    const newRotation = mapEvent.frameState?.viewState.rotation
    if (newRotation && newRotation !== rotation.value) {
        rotation.value = newRotation
    }
}
</script>

<template>
    <!-- The rotation constraint of the openlayers view by default snaps to zero. This means that
    even if the angle is not normalized, it will automatically be set to zero if pointing to the
    north -->
    <button
        v-if="showCompass"
        class="toolbox-button d-print-none"
        data-cy="compass-button"
        type="button"
        :title="t('rotate_reset')"
        @click="resetRotation"
    >
        <!-- SVG icon adapted from "https://www.svgrepo.com/svg/883/compass" (and greatly
            simplified the code). Original icon was liscensed under the CCO liscense. -->
        <svg
            class="compass-button-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -240 200 480"
            :style="{ transform: `rotate(${rotation}rad)` }"
        >
            <polygon
                class="south-arrow"
                points="-100,0 100,0 0,240"
            />
            <polygon
                class="north-arrow"
                points="-100,0 100,0 0,-240"
            />
        </svg>
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
.compass-button {
    &-icon {
        height: $map-button-diameter - 5px;
        width: $map-button-diameter;
        .north-arrow {
            fill: $venetian-red;
        }
        .south-arrow {
            fill: $cerulean;
        }
    }
}
</style>
