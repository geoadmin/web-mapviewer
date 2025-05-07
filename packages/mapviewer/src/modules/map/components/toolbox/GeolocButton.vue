<script setup>
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'

const dispatcher = { dispatcher: 'GeolocButton.vue' }

const { compassButton } = defineProps({
    /** Add the compass button (only available in 2D mode) */
    compassButton: { type: Boolean, default: false },
})

const store = useStore()
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

const isActive = computed(() => store.state.geolocation.active)
const isDenied = computed(() => store.state.geolocation.denied)
const isTracking = computed(() => store.state.geolocation.tracking)
const autoRotation = computed(() => store.state.position.autoRotation)
const hasOrientation = computed(() => store.state.position.hasOrientation)
const is3dActive = computed(() => store.state.cesium.active)
const hasTrackingFeedback = computed(() => isActive.value && !isTracking.value)
const hastAutoRotationFeedback = computed(
    () => isActive.value && hasOrientation.value && !autoRotation.value
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
    <div
        ref="geolocationButton"
        class="geoloc-button-div"
    >
        <GeoadminTooltip
            placement="left"
            :tooltip-content="tooltipContent"
            :use-extra-padding="true"
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

@include respond-above('md') {
    .geoloc-tooltip {
        white-space: nowrap;
    }
}
</style>
