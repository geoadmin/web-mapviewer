<template>
    <!-- The rotation constraint of the openlayers view by default snaps to zero. This means that
    even if the angle is not normalized, it will automatically be set to zero if pointing to the
    north -->
    <button
        v-if="Math.abs(rotation) >= 1e-9"
        class="toolbox-button d-print-none"
        data-cy="compass-button"
        type="button"
        :title="$t('rotate_reset')"
        @click="resetRotation"
    >
        <!-- SVG icon adapted from "https://www.svgrepo.com/svg/883/compass" (and greatly
            simplified the code). Original icon was liscensed under the CCO liscense. -->
        <svg
            class="compass-button-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -240 200 480"
            :style="{ transform: `rotate(${rotation}rad)` }"
        >
            <polygon style="fill: #cd2a00" points="-100,0 100,0 0,240" />
            <polygon style="fill: #ff3501" points="-100,0 100,0 0,-240" />
        </svg>
    </button>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    inject: ['getMap'],

    data() {
        return {
            rotation: 0,
        }
    },
    mounted() {
        this.getMap().on('postrender', this.onRotate)
    },
    unmounted() {
        this.getMap().un('postrender', this.onRotate)
    },
    methods: {
        ...mapActions(['setRotation']),
        resetRotation() {
            this.setRotation(0)
        },
        onRotate(mapEvent) {
            const newRotation = mapEvent.frameState.viewState.rotation
            if (newRotation !== this.rotation) {
                this.rotation = newRotation
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import '../../../menu/scss/toolbox-buttons';
.compass-button {
    &-icon {
        height: $map-button-diameter - 5px;
    }
}
</style>
