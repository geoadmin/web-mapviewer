<template>
    <div v-if="backgroundLayers.length > 0" class="bg-selector-container">
        <div
            class="bg-selector"
            :class="{
                'animate__animated animate__pulse bigger-pulse animate__faster': animateMainButton,
            }"
            @click="toggleBackgroundWheel"
            @animationend="animateMainButton = false"
        />
        <div class="bg-selector-wheel">
            <transition-group name="bg-slide-up">
                <div
                    v-for="(background, index) in backgroundLayersWithVoid"
                    v-show="showBgWheel"
                    :key="background.getID()"
                    class="bg-selector"
                    :class="[
                        `bg-${background.getID().replaceAll('.', '-')}`,
                        `bg-index-${index}`,
                        { active: background.getID() === currentBackgroundLayerId },
                    ]"
                    @click="selectBackgroundWithLayerId(background.getID())"
                />
            </transition-group>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

const voidLayer = {
    id: 'void',
    index: -1,
}

export default {
    data() {
        return {
            showBgWheel: false,
            animateMainButton: false,
        }
    },
    computed: {
        ...mapGetters(['backgroundLayers', 'currentBackgroundLayer', 'getLayerForGeoAdminId']),
        ...mapState({
            currentBackgroundLayerId: (state) => state.layers.backgroundLayerId,
        }),
        currentBackgroundLayerWithVoid: function () {
            const currentBg = this.currentBackgroundLayer
            if (!currentBg) {
                return voidLayer
            }
            return currentBg
        },
        backgroundLayersWithVoid: function () {
            // adding void layer on top
            return [{ getID: () => 'void' }, ...this.backgroundLayers]
        },
    },
    methods: {
        ...mapActions(['setBackground']),
        selectBackgroundWithLayerId: function (layerId) {
            this.setBackground(layerId === 'void' ? null : layerId)
            this.toggleBackgroundWheel()
        },
        toggleBackgroundWheel: function () {
            this.showBgWheel = !this.showBgWheel
            this.animateMainButton = this.showBgWheel
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$bg-button-border-size: 8px;
$bg-button-border-size-in-wheel: 3px;

.bg-selector-container {
    position: relative;
}
.bg-selector {
    position: relative;
    height: $map-button-diameter;
    width: $map-button-diameter;
    background-image: url('../assets/backgrounds_mobile.png');
    background-repeat: no-repeat;
    background-size: initial;
    border-radius: $map-button-diameter * 0.5;
    border: $bg-button-border-size solid $gray-800;
    cursor: pointer;
}
.bg-selector-wheel {
    position: absolute;
    bottom: 3.2rem;
    .bg-selector {
        border: $bg-button-border-size-in-wheel solid $gray-800;
        margin-top: 0.5rem;

        &.bg-void {
            background: $white url('../../../assets/grid.png');
        }
        &.bg-ch-swisstopo-pixelkarte-farbe {
            background-position: -80px 0;
        }
        &.bg-ch-swisstopo-pixelkarte-grau {
            background-position: -39px 0;
        }
        &.active {
            border-color: $red;
        }
    }
}
.bg-slide-up-leave-active,
.bg-slide-up-enter-active {
    transition: 0.3s;
}
.bg-slide-up-enter,
.bg-slide-up-leave-to {
    opacity: 0;
    &.bg-index-0 {
        transform: translate(0, 300%);
    }
    &.bg-index-1 {
        transform: translate(0, 200%);
    }
    &.bg-index-2 {
        transform: translate(0, 100%);
    }
}
@keyframes bigger-pulse {
    from {
        transform: scale3d(1, 1, 1);
    }
    50% {
        transform: scale3d(1.25, 1.25, 1.25);
    }
    to {
        transform: scale3d(1, 1, 1);
    }
}
.bigger-pulse {
    animation-name: bigger-pulse;
    animation-timing-function: ease-in-out;
}
</style>
