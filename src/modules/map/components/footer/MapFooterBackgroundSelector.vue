<template>
    <div
        v-if="backgroundLayers.length > 0"
        class="bg-selector"
        :class="{ 'bg-selector-open': showBgWheel }"
    >
        <div class="bg-selector-wheel">
            <button
                v-for="(background, index) in backgroundLayersWithVoid"
                :key="background.getID()"
                class="bg-selector-button"
                :class="[
                    getLayerClass(background),
                    `bg-index-${index}`,
                    { active: background.getID() === currentBackgroundLayerId },
                ]"
                type="button"
                :tabindex="showBgWheel ? 0 : -1"
                @click="selectBackground(background, $event)"
            />
        </div>
        <button
            class="bg-selector-trigger"
            :class="[
                { 'bigger-pulse': animateMainButton },
                getLayerClass(currentBackgroundLayerWithVoid),
            ]"
            type="button"
            @click="toggleBackgroundWheel"
            @animationend="onAnimationEnd"
        />
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

const voidLayer = {
    id: 'void',
    index: -1,
    getID() {
        return this.id
    },
}

export default {
    data() {
        return {
            showBgWheel: false,
            animateMainButton: false,
        }
    },
    computed: {
        ...mapGetters(['backgroundLayers', 'currentBackgroundLayer']),
        ...mapState({
            currentBackgroundLayerId: (state) => state.layers.backgroundLayerId,
        }),
        currentBackgroundLayerWithVoid() {
            if (!this.currentBackgroundLayer) {
                return voidLayer
            }
            return this.currentBackgroundLayer
        },
        backgroundLayersWithVoid() {
            // adding void layer on top
            return [voidLayer, ...this.backgroundLayers]
        },
    },
    methods: {
        ...mapActions(['setBackground']),
        selectBackground(layer, event) {
            this.setBackground(layer.getID())
            this.toggleBackgroundWheel()
            event.target.blur()
        },
        toggleBackgroundWheel() {
            this.showBgWheel = !this.showBgWheel
            this.animateMainButton = this.showBgWheel
        },
        onAnimationEnd() {
            this.animateMainButton = false
        },
        getLayerClass(layer) {
            return 'bg-' + layer.getID().replaceAll('.', '-')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$transition-duration: 0.3s;
$map-button-gap: 0.5rem;

.bg-selector {
    position: relative;
}

.bg-selector-button {
    height: $map-button-diameter;
    width: $map-button-diameter;
    padding: 0;
    background-image: url('../../../menu/assets/backgrounds_mobile.png');
    background-repeat: no-repeat;
    border-style: solid;
    border-color: $gray-800;
    border-radius: 50%;

    &.bg-void {
        background: $white url('../../../../assets/grid.png');
    }
    &.bg-ch-swisstopo-swissimage {
        background-position: 0 0;
    }
    &.bg-ch-swisstopo-pixelkarte-grau {
        background-position: -38px 0;
    }
    &.bg-ch-swisstopo-pixelkarte-farbe {
        background-position: -81px 0;
    }
}

.bg-selector-trigger {
    @extend .bg-selector-button;
    position: relative;
    border-width: 8px;
}

.bg-selector-wheel {
    position: absolute;
    bottom: 0;
    opacity: 0;

    transition-property: bottom, opacity;
    transition-duration: $transition-duration;

    .bg-selector-button {
        border-width: 3px;
        transition-property: transform, opacity;
        transition-duration: $transition-duration;
        transform: translateY(0);
        position: absolute;
        bottom: 0;

        &.active {
            border-color: $red;
        }
    }
}

.bg-selector-open {
    .bg-selector-wheel {
        bottom: calc($map-button-diameter + $map-button-gap);
        opacity: 1;
    }

    .bg-index-0 {
        $offset: calc(($map-button-diameter + $map-button-gap) * -3);
        transform: translateY($offset);
    }
    .bg-index-1 {
        $offset: calc(($map-button-diameter + $map-button-gap) * -2);
        transform: translateY($offset);
    }
    .bg-index-2 {
        $offset: calc(($map-button-diameter + $map-button-gap) * -1);
        transform: translateY($offset);
    }
}

@keyframes bigger-pulse {
    from {
        transform: scale3d(1, 1, 1);
    }
    20% {
        transform: scale3d(1.25, 1.25, 1.25);
    }
    to {
        transform: scale3d(1, 1, 1);
    }
}
.bigger-pulse {
    animation-name: bigger-pulse;
    animation-timing-function: ease-in-out;
    animation-duration: $transition-duration;
}
</style>
