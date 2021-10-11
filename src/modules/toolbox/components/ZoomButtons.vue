<template>
    <div class="zoom d-none d-md-block d-print-none">
        <a
            class="zoom-button zoom-in mb-1"
            data-cy="zoom-in"
            title="Zoom in"
            @click="increaseZoom()"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
        </a>
        <a
            class="zoom-button zoom-out mb-1"
            data-cy="zoom-out"
            title="Zoom out"
            @click="decreaseZoom()"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
        </a>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions(['increaseZoom', 'decreaseZoom']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/bootstrap-theme';
$normal-color: $gray-800;
$active-color: $primary;
$disabled-color: $gray-300;
.zoom-button {
    display: block;
    height: $map-button-diameter;
    width: $map-button-diameter;
    border-radius: $map-button-diameter * 0.5;
    overflow: hidden;
    cursor: pointer;
    background-color: $normal-color;
    &:hover {
        background-color: $gray-700;
    }
    .button-inner-circle {
        stroke: $white;
        fill: $normal-color;
    }
    svg {
        overflow: initial;
        position: relative;
        top: 7px;
        left: 0;
        font-size: 26px;
        color: $white;
    }
}
</style>
