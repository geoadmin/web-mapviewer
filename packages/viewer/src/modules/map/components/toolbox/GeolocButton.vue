<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
import useGeolocationStore from '@/store/modules/geolocation.store'
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'

const dispatcher = { name: 'GeolocButton.vue' }

const { compassButton = false } = defineProps<{
    compassButton?: boolean
}>()

const geolocationStore = useGeolocationStore()
const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()
const { t } = useI18n()

const tooltipContent = computed(() => {
    let key
    if (isDenied.value) {
        key = 'geoloc_permission_denied'
    } else if (hasTrackingFeedback.value) {
        key = 're_center_map'
    } else if (hastAutoRotationFeedback.value) {
        key = 'orient_map_north'
    } else if (isActive.value) {
        key = 'geoloc_stop_tracking'
    } else {
        key = 'geoloc_start_tracking'
    }
    return t(key)
})

const isActive = computed(() => geolocationStore.active)
const isDenied = computed(() => geolocationStore.denied)
const isTracking = computed(() => geolocationStore.tracking)
const autoRotation = computed(() => positionStore.autoRotation)
const hasOrientation = computed(() => positionStore.hasOrientation)
const is3dActive = computed(() => cesiumStore.active)
const hasTrackingFeedback = computed(() => isActive.value && !isTracking.value)
const hastAutoRotationFeedback = computed(
    () => isActive.value && hasOrientation.value && !autoRotation.value
)
function toggleGeolocation(): void {
    if (!isActive.value) {
        geolocationStore.toggleGeolocation(dispatcher)
        if (hasTrackingFeedback.value) {
            geolocationStore.setGeolocationTracking(true, dispatcher)
        }
    } else {
        if (hasTrackingFeedback.value) {
            geolocationStore.setGeolocationTracking(true, dispatcher)
        } else if (hastAutoRotationFeedback.value) {
            positionStore.setAutoRotation(true, dispatcher)
        } else {
            geolocationStore.toggleGeolocation(dispatcher)
            positionStore.setAutoRotation(false, dispatcher)
            geolocationStore.setGeolocationTracking(false, dispatcher)
        }
    }
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
        </GeoadminTooltip>
        <OpenLayersCompassButton
            v-if="!is3dActive && compassButton"
            :hide-if-north="!autoRotation"
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
