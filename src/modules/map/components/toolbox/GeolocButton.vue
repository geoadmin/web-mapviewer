<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'GeolocButton.vue' }

const store = useStore()

useTippyTooltip('.geoloc-button-div[data-tippy-content]', { placement: 'left' })

const isActive = computed(() => store.state.geolocation.active)
const isDenied = computed(() => store.state.geolocation.denied)
const headingIsAbsolute = computed(() => store.state.position.headingIsAbsolute)
const autoRotation = computed(() => store.state.position.autoRotation)
const tippyContent = computed(() => {
    if (isDenied.value) {
        return 'geoloc_permission_denied'
    }
    if (isActive.value && headingIsAbsolute.value && !autoRotation.value) {
        return 'orient_map_north'
    }
    if (isActive.value) {
        return 'geoloc_stop_tracking'
    }
    return 'geoloc_start_tracking'
})

function toggleGeolocation() {
    if (!headingIsAbsolute.value) {
        store.dispatch('toggleGeolocation', dispatcher)
    } else {
        if (!isActive.value) {
            store.dispatch('toggleGeolocation', dispatcher)
        } else if (isActive.value && !autoRotation.value) {
            store.dispatch('setAutoRotation', !autoRotation.value)
        } else {
            store.dispatch('toggleGeolocation', dispatcher)
            store.dispatch('setAutoRotation', !autoRotation.value)
        }
    }
}
</script>

<template>
    <!-- Here below we need to set the tippy to an external div instead of directly to the button,
     otherwise the tippy won't work when the button is disabled -->
    <div class="geoloc-button-div" :data-tippy-content="tippyContent">
        <button
            class="toolbox-button"
            type="button"
            :disabled="isDenied"
            :class="{ 'geoloc-button': !autoRotation, active: isActive, disabled: isDenied }"
            data-cy="geolocation-button"
            @click="toggleGeolocation"
        >
            <svg v-if="!autoRotation" xmlns="http://www.w3.org/2000/svg" y="0" x="0">
                <ellipse class="geoloc-button-inner-circle" />
            </svg>
            <span v-else>
                <FontAwesomeIcon style="position: absolute" icon="arrow-up" />
                <FontAwesomeIcon :icon="['fas', 'n']" />
            </span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';

$normal-color: $map-button-border-color;
$stroke-width: 9px;
$radius-circle: calc(($map-button-inner-icon-diameter / 2) - ($stroke-width / 2));
.geoloc-button {
    svg {
        overflow: initial;
        position: relative;
        top: $map-button-diameter * 0.5;
        left: $map-button-diameter * 0.5;
        height: $map-button-diameter;
    }
    .geoloc-button-inner-circle {
        stroke: $white;
        fill: $normal-color;
        stroke-width: $stroke-width;
        rx: $radius-circle;
        ry: $radius-circle;
    }
    &.active {
        .geoloc-button-inner-circle {
            fill: $primary;
        }
    }
    &.disabled {
        opacity: 0.8;
        .geoloc-button-inner-circle {
            stroke: $gray-300;
        }
    }
}
</style>
