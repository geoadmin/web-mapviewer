<template>
    <!-- The rotation constraint of the openlayers view by default snaps to zero. This means that
    even if the angle is not normalized, it will automatically be set to zero if pointing to the
    north -->
    <div v-if="Math.abs(rotation) >= 1e-9" class="zoom d-print-none">
        <button
            class="compass-button"
            data-cy="compass-button"
            type="button"
            :title="$t('rotate_reset')"
            @click="onNorthen"
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
    </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    inject: ['getMap'],
    emits: ['northen'],

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
        onNorthen() {
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
@import 'src/scss/webmapviewer-bootstrap-theme';
.compass-button {
    padding: 0;
    height: $map-button-diameter;
    width: $map-button-diameter;
    border-radius: $map-button-diameter * 0.5;
    border: $map-button-border-width solid $map-button-border-color;
    cursor: pointer;
    background-color: $white;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
        border-color: $map-button-hover-border-color;
    }
    &-icon {
        height: $map-button-diameter - 5px;
    }
}
</style>
