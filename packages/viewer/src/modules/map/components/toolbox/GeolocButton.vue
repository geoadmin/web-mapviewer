<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
import RecenterButton from '@/modules/map/components/toolbox/RecenterButton.vue'
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
    } else if (geolocationStore.active) {
        key = 'geoloc_stop_tracking'
    } else {
        key = 'geoloc_start_tracking'
    }
    return t(key)
})

function toggleGeolocation(): void {
    console.log(
        '[toggleGeolocation] Before state, geolocationStore.active: ',
        geolocationStore.active,
        'geolocationStore.tracking: ',
        geolocationStore.tracking
    )

    // Simply toggle geolocation on/off
    geolocationStore.toggleGeolocation(dispatcher)

    // If turning off geolocation, also disable tracking and auto-rotation
    if (!geolocationStore.active) {
        geolocationStore.setGeolocationTracking(false, dispatcher)
        if (positionStore.autoRotation) {
            positionStore.setRotation(0, dispatcher)
            positionStore.setAutoRotation(false, dispatcher)
        }
    }

    console.log(
        '[toggleGeolocation] After state, geolocationStore.active: ',
        geolocationStore.active,
        'geolocationStore.tracking: ',
        geolocationStore.tracking
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
                        icon="location-arrow"
                        transform="shrink-2 down-1 left-1"
                    />
                </span>
            </button>
        </GeoadminTooltip>
        <!-- Recenter button: Shows when geolocation is active - enables tracking mode -->
        <RecenterButton />
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
