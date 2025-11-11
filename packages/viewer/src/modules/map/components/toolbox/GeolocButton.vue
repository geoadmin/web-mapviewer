<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
// import RecenterButton from '@/modules/map/components/toolbox/RecenterButton.vue'
import useCesiumStore from '@/store/modules/cesium'
import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'GeolocButton.vue' }

const { compassButton = false } = defineProps<{
    compassButton?: boolean
}>()

const geolocationStore = useGeolocationStore()
const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()
const { t } = useI18n()

const tooltipContent = computed(() => {
    let key
    if (geolocationStore.denied) {
        key = 'geoloc_permission_denied'
    } else if (hasTrackingFeedback.value) {
        key = 're_center_map'
    } else if (hasAutoRotationFeedback.value) {
        key = 'orient_map_north'
    } else if (geolocationStore.active) {
        key = 'geoloc_stop_tracking'
    } else {
        key = 'geoloc_start_tracking'
    }
    return t(key)
})

const hasTrackingFeedback = computed(
    () => geolocationStore.active && !geolocationStore.tracking
)
const hasAutoRotationFeedback = computed(
    () => geolocationStore.active && positionStore.hasOrientation && !positionStore.autoRotation
)
function toggleGeolocation(): void {
    console.log(
        '[toggleGeolocation] Before state, geolocationStore.active: ',
        geolocationStore.active,
        'geolocationStore.tracking: ',
        geolocationStore.tracking,
        'autorotation: ',
        positionStore.autoRotation
    )
    // If the geolocation is not active, simply activate it
    if (!geolocationStore.active) {
        geolocationStore.toggleGeolocation(dispatcher)
        // Always enable tracking after activation (matching old implementation)
        console.log('[toggleGeolocation] Post-activation: enabling tracking')
        geolocationStore.setGeolocationTracking(true, dispatcher)
    } else {
        // If the geolocation is active
        if (hasTrackingFeedback.value) {
            // Enable continuous tracking
            console.log('[toggleGeolocation] Enabling tracking (continuous follow mode)')
            geolocationStore.setGeolocationTracking(true, dispatcher)
        } else if (hasAutoRotationFeedback.value) {
            // Enable auto-rotation
            positionStore.setAutoRotation(true, dispatcher)
        } else {
            // Disable geolocation
            geolocationStore.toggleGeolocation(dispatcher)
            // Reset rotation if it was being controlled by auto-rotation
            if (positionStore.autoRotation) {
                positionStore.setRotation(0, dispatcher)
            }
            positionStore.setAutoRotation(false, dispatcher)
            geolocationStore.setGeolocationTracking(false, dispatcher)
        }
    }
    console.log(
        '[toggleGeolocation] After state, geolocationStore.active: ',
        geolocationStore.active,
        'geolocationStore.tracking: ',
        geolocationStore.tracking,
        'autorotation: ',
        positionStore.autoRotation
    )
}
</script>

<template>
    <div
        ref="geolocationButton"
        class="geoloc-button-div"
    >
        <GeoadminTooltip
            placement="left"
            :tooltip-content="tooltipContent"
        >
            <button
                class="toolbox-button d-print-none"
                type="button"
                :disabled="geolocationStore.denied"
                :class="{ active: geolocationStore.active, disabled: geolocationStore.denied }"
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
                        v-if="positionStore.autoRotation"
                        icon="minus"
                        transform="shrink-10 up-7 rotate--90"
                    />
                    <FontAwesomeIcon
                        v-if="positionStore.autoRotation"
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
        </GeoadminTooltip>
        <!-- Recenter button: Shows only when geolocation is active and map center is >1m away from user's location -->
        <!-- TODO: Re-enable RecenterButton later - it only recenters the map without affecting geolocation/tracking state -->
        <!-- <RecenterButton /> -->
        <!-- Compass button: Shows when map is rotated, or when auto-rotation is enabled (for orientation feedback) -->
        <OpenLayersCompassButton
            v-if="!cesiumStore.active && compassButton"
            :hide-if-north="geolocationStore.active ? !positionStore.autoRotation : true"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
@import '@/scss/media-query.mixin';

.geoloc-button-div {
    background-color: $map-button-hover-border-color;
    border-radius: $map-button-diameter * 0.5;
}
</style>
