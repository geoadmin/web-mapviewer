<script setup>
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'GeolocButton.vue' }

const { compassButton } = defineProps({
    /** Add the compass button (only available in 2D mode) */
    compassButton: { type: Boolean, default: false },
})

const store = useStore()

const geolocationButton = useTemplateRef('geolocationButton')
const tooltipContent = computed(() => {
    if (isDenied.value) {
        return 'geoloc_permission_denied'
    }
    if (hasTrackingFeedback.value) {
        return 're_center_map'
    }
    if (hastAutoRotationFeedback.value) {
        return 'orient_map_north'
    }
    if (isActive.value) {
        return 'geoloc_stop_tracking'
    }
    return 'geoloc_start_tracking'
})
useTippyTooltip(geolocationButton, tooltipContent, { placement: 'left' })

const isActive = computed(() => store.state.geolocation.active)
const isDenied = computed(() => store.state.geolocation.denied)
const isTracking = computed(() => store.state.geolocation.tracking)
const autoRotation = computed(() => store.state.position.autoRotation)
const hasOrientation = computed(() => store.state.position.hasOrientation)
const is3dActive = computed(() => store.state.cesium.active)
const hasTrackingFeedback = computed(() => isActive.value && !is3dActive.value && !isTracking.value)
const hastAutoRotationFeedback = computed(
    () => isActive.value && !is3dActive.value && hasOrientation.value && !autoRotation.value
)
function toggleGeolocation() {
    if (!isActive.value) {
        store.dispatch('toggleGeolocation', dispatcher)
        if (hasTrackingFeedback.value) {
            store.dispatch('setGeolocationTracking', { tracking: true, ...dispatcher })
        }
    } else {
        if (hasTrackingFeedback.value) {
            store.dispatch('setGeolocationTracking', { tracking: true, ...dispatcher })
        } else if (hastAutoRotationFeedback.value) {
            store.dispatch('setAutoRotation', { autoRotation: true, ...dispatcher })
        } else {
            store.dispatch('toggleGeolocation', dispatcher)
            store.dispatch('setAutoRotation', { autoRotation: false, ...dispatcher })
            store.dispatch('setGeolocationTracking', { tracking: false, ...dispatcher })
        }
    }
}
</script>

<template>
    <!-- Here below we need to set the tippy to an external div instead of directly to the button,
     otherwise the tippy won't work when the button is disabled -->
    <div
        ref="geolocationButton"
        class="geoloc-button-div"
    >
        <button
            class="toolbox-button d-print-none"
            type="button"
            :disabled="isDenied"
            :class="{ active: isActive, disabled: isDenied }"
            data-cy="geolocation-button"
            @click="toggleGeolocation"
        >
            <span class="fa-layers fa-fw h-100 w-100">
                <FontAwesomeIcon
                    v-if="hasTrackingFeedback"
                    :icon="['far', 'circle']"
                    transform="grow-4"
                />
                <FontAwesomeIcon
                    v-if="autoRotation"
                    icon="minus"
                    transform="shrink-10 up-7 rotate--90"
                />
                <FontAwesomeIcon
                    v-if="autoRotation"
                    icon="location-arrow"
                    transform="shrink-4 down-4 rotate--45"
                />
                <FontAwesomeIcon
                    v-else
                    icon="location-arrow"
                    transform="shrink-2 down-1 left-1"
                />
            </span>
        </button>
        <OpenLayersCompassButton
            v-if="!is3dActive && compassButton"
            :hide-if-north="!autoRotation"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';

.geoloc-button-div {
    background-color: $map-button-hover-border-color;
    border-radius: $map-button-diameter * 0.5;
}
</style>
