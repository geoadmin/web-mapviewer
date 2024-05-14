<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'GeolocButton.vue' }

const store = useStore()

useTippyTooltip('.geoloc-button[data-tippy-content]', { placement: 'left' })

const isActive = computed(() => store.state.geolocation.active)
const isDenied = computed(() => store.state.geolocation.denied)

function toggleGeolocation() {
    store.dispatch('toggleGeolocation', dispatcher)
}
</script>

<template>
    <button
        class="toolbox-button geoloc-button"
        type="button"
        :class="{ active: isActive, disabled: isDenied }"
        :data-tippy-content="isActive ? 'geoloc_stop_tracking' : 'geoloc_start_tracking'"
        data-cy="geolocation-button"
        @click="toggleGeolocation"
    >
        <svg xmlns="http://www.w3.org/2000/svg" y="0" x="0">
            <ellipse class="geoloc-button-inner-circle" />
        </svg>
    </button>
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
