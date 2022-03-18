<template>
    <div class="zoom d-print-none">
        <a class="zoom-button zoom-in mb-1" data-cy="zoom-in" title="Zoom in" @click="onZoomIn">
            <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
        </a>
        <a class="zoom-button zoom-out mb-1" data-cy="zoom-out" title="Zoom out" @click="onZoomOut">
            <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
        </a>
    </div>
</template>

<script>
export default {
    emits: ['zoom-in', 'zoom-out'],
    methods: {
        onZoomIn() {
            this.$emit('zoom-in')
        },
        onZoomOut() {
            this.$emit('zoom-out')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
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
    text-align: center;
    &:hover {
        background-color: $gray-700;
    }
    .button-inner-circle {
        stroke: $white;
        fill: $normal-color;
    }
    .svg-inline--fa {
        overflow: initial;
        position: relative;
        top: 7px;
        left: 0;
        font-size: 26px;
        color: $white;
    }
}
</style>
