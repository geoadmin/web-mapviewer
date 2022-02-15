<template>
    <!-- The initialization will fail with `v-if` if initial zoom is too low. -->
    <div v-show="currentZoom >= 9" ref="scaleLine" data-cy="scaleline" />
</template>

<script>
import ScaleLine from 'ol/control/ScaleLine'

export default {
    inject: ['getMap'],
    props: {
        currentZoom: {
            type: Number,
            required: true,
        },
    },
    created() {
        this.scaleLine = new ScaleLine({
            className: 'scale-line',
        })
    },
    mounted() {
        this.scaleLine.setTarget(this.$refs.scaleLine)
        this.getMap().addControl(this.scaleLine)
    },
    unmounted() {
        this.getMap().removeControl(this.scaleLine)
    },
}
</script>

<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';

.scale-line {
    width: 150px;

    &-inner {
        max-width: 100%;
        border: 2px solid $black;
        border-top: none;
        text-align: center;
        font-weight: bold;
        color: $black;
    }
}
</style>
