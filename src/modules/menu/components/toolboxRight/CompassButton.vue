<template>
    <div v-if="rotation" class="zoom d-print-none">
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
import { mapActions, mapState } from 'vuex'
export default {
    emits: ['northen'],
    computed: {
        ...mapState({
            rotation: (state) => state.position.rotation,
        }),
    },
    methods: {
        ...mapActions(['setRotation']),
        onNorthen() {
            this.setRotation(0)
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
        transition: transform 0.25s ease-in-out;
        height: $map-button-diameter - 5px;
    }
}
</style>
