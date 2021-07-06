<template>
    <div
        class="geoloc-button"
        :class="{ active: isActive, disabled: isDenied }"
        data-cy="geolocation-button"
        @click="toggleGeolocation"
    >
        <svg xmlns="http://www.w3.org/2000/svg" y="0" x="0">
            <ellipse class="geoloc-button-inner-circle" rx="8" ry="8" stroke-width="9" />
        </svg>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
    computed: {
        ...mapState({
            isActive: (state) => state.geolocation.active,
            isDenied: (state) => state.geolocation.denied,
        }),
    },
    methods: {
        ...mapActions(['toggleGeolocation']),
    },
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/variables';

$normal-color: $gray-800;
$active-color: $red;
$disabled-color: $gray-300;

.geoloc-button {
    height: $map-button-diameter;
    width: $map-button-diameter;
    border-radius: $map-button-diameter * 0.5;
    background-color: $normal-color;
    overflow: hidden;
    cursor: pointer;
    svg {
        overflow: initial;
        position: relative;
        top: 50%;
        left: 50%;
    }
    .geoloc-button-inner-circle {
        stroke: $white;
        fill: $normal-color;
    }
    &.active {
        background-color: $active-color;
        .geoloc-button-inner-circle {
            fill: $active-color;
        }
    }
    &.disabled {
        opacity: 0.8;
        .geoloc-button-inner-circle {
            stroke: $disabled-color;
        }
    }
}
</style>
