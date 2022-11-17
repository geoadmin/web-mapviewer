<template>
    <div class="zoom d-print-none">
        <button
            class="zoom-button zoom-in mb-1"
            data-cy="zoom-in"
            :title="$t('zoom_in')"
            @click="onZoomIn"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
        </button>
        <button
            class="zoom-button zoom-out mb-1"
            data-cy="zoom-out"
            :title="$t('zoom_out')"
            @click="onZoomOut"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
        </button>
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
.zoom-button {
    border: none;
    padding: 0;
    display: block;
    height: $map-button-diameter;
    width: $map-button-diameter;
    border-radius: $map-button-diameter * 0.5;
    overflow: hidden;
    cursor: pointer;
    background-color: $map-button-border-color;
    text-align: center;
    font-size: 0px; // Needed to fully center the icon
    &:hover {
        background-color: $map-button-hover-border-color;
    }
    .button-inner-circle {
        stroke: $white;
        fill: $map-button-border-color;
    }
    .svg-inline--fa {
        height: $map-button-inner-icon-diameter;
        color: $white;
    }
}
</style>
