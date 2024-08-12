<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'GeolocButton.vue' }

const store = useStore()

useTippyTooltip('.geoloc-button-div[data-tippy-content]', { placement: 'left' })

const isActive = computed(() => store.state.geolocation.active)
const isDenied = computed(() => store.state.geolocation.denied)
const isTracking = computed(() => store.state.geolocation.tracking)
const autoRotation = computed(() => store.state.position.autoRotation)
const hasOrientation = computed(() => store.state.position.hasOrientation)
const tippyContent = computed(() => {
    if (isDenied.value) {
        return 'geoloc_permission_denied'
    }
    if (isActive.value && !isTracking.value) {
        return 're_center_map'
    }
    if (isActive.value && !autoRotation.value) {
        return 'orient_map_north'
    }
    if (isActive.value) {
        return 'geoloc_stop_tracking'
    }
    return 'geoloc_start_tracking'
})

function toggleGeolocation() {
    if (!isActive.value) {
        store.dispatch('toggleGeolocation', dispatcher)
    } else {
        if (!isTracking.value) {
            store.dispatch('setGeolocationTracking', { tracking: true, ...dispatcher })
        } else if (!autoRotation.value && hasOrientation.value) {
            store.dispatch('setAutoRotation', { autoRotation: true, ...dispatcher })
        } else {
            store.dispatch('toggleGeolocation', dispatcher)
            store.dispatch('setAutoRotation', { autoRotation: false, ...dispatcher })
        }
    }
}
</script>

<template>
    <!-- Here below we need to set the tippy to an external div instead of directly to the button,
     otherwise the tippy won't work when the button is disabled -->
    <div class="geoloc-button-div" :data-tippy-content="tippyContent">
        <button
            class="toolbox-button d-print-none d-flex flex-column align-items-center justify-content-center"
            type="button"
            :disabled="isDenied"
            :class="{ active: isActive, disabled: isDenied }"
            data-cy="geolocation-button"
            @click="toggleGeolocation"
        >
            <FontAwesomeIcon
                v-if="(!isTracking && isActive) || true"
                icon="circle"
                class="orientation-arrow-dot"
                :class="{ hide: isTracking || !isActive }"
            />
            <FontAwesomeIcon
                :style="autoRotation ? { transform: 'rotate(-45deg)' } : ''"
                icon="location-arrow"
            />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';

.orientation-arrow-dot {
    width: 5px;
    height: 5px !important;
    margin-bottom: 3px;
}

.hide {
    display: none;
}
</style>
