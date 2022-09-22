<template>
    <div
        v-if="backgroundLayers.length > 0"
        class="bg-selector"
        :class="{ 'bg-selector-open': showBgWheel }"
        data-cy="background-selector"
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
                :data-cy="`background-selector-${background.getID()}`"
                @click="selectBackground(background, $event)"
            >
                <div class="bg-selector-button-label">
                    {{ $t(getLayerTranslationLabel(background)) }}
                </div>
            </button>
        </div>
        <button
            class="bg-selector-trigger"
            :class="[
                { 'bigger-pulse': animateMainButton },
                getLayerClass(currentBackgroundLayerWithVoid),
            ]"
            type="button"
            :title="$t('bg_toggle')"
            @click="toggleBackgroundWheel"
            @animationend="onAnimationEnd"
        >
            <div v-if="!showBgWheel" class="bg-selector-button-label">
                {{ $t('bg_chooser_label') }}
            </div>
            <div v-if="showBgWheel" class="bg-selector-button-label">
                <font-awesome-icon :icon="['fas', 'circle-chevron-right']" />
            </div>
        </button>
    </div>
</template>

<script>
import { VECTOR_TILES_STYLE_ID } from '@/config'
import { mapActions, mapGetters, mapState } from 'vuex'

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
        getLayerTranslationLabel(layer) {
            switch (layer.getID()) {
                case 'void':
                    return 'void_layer'
                case 'ch.swisstopo.pixelkarte-farbe':
                    return 'bg_pixel_color'
                case 'ch.swisstopo.pixelkarte-grau':
                    return 'bg_pixel_grey'
                case 'ch.swisstopo.swissimage':
                    return 'bg_luftbild'
                case VECTOR_TILES_STYLE_ID:
                    return 'basis'
                default:
                    return layer.name || layer.getID()
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/scss/media-query.mixin';

$transition-duration: 0.3s;
$map-button-gap: 0.5rem;
$menu-button-diameter: 3px;

.bg-selector {
    position: relative;
}

.bg-selector-button {
    height: $map-button-diameter;
    width: $map-button-diameter;
    transition: width $transition-duration;
    padding: 0;
    background-image: url('../../../menu/assets/backgrounds_mobile.png');
    background-repeat: no-repeat;
    border-style: solid;
    border-color: $map-button-border-color;
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
    &.bg-ch-swisstopo-leichte-basiskarte_world-vt {
        background-position: -122px 0;
    }
    &:hover {
        border-color: $map-button-hover-border-color;
    }
}

.bg-selector-button-label {
    position: absolute;
    top: 0;
    width: 100%;
    background: rgba($white, 0.7);
    font-size: 0.7rem;
    display: none;
    white-space: nowrap;
}

.bg-selector-trigger {
    @extend .bg-selector-button;
    position: relative;
    border-width: $map-button-border-width;
}

.bg-selector-wheel {
    position: absolute;
    bottom: 0;
    left: 0;
    opacity: 0;

    transition-property: bottom, left, opacity;
    transition-duration: $transition-duration;

    .bg-selector-button {
        border-width: $menu-button-diameter;
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
    $numberOfBackgrounds: 4;
    @for $i from 0 through $numberOfBackgrounds {
        .bg-index-#{$i} {
            $offset: calc(($map-button-diameter + $map-button-gap) * ($i - $numberOfBackgrounds));
            transform: translateY($offset);
        }
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

@include respond-above(tablet) {
    $desktop-map-button-width: 96px;
    .bg-selector-button {
        width: $desktop-map-button-width;
        border-color: $white;
        height: 64px;
        border-radius: initial;
        background-image: url('../../../menu/assets/backgrounds.jpg');
        background-size: 392px;
        // Original size: 180px x 4 = 720px image, 5px x 3 = 15px border => 735px (100%)
        // Size after reducing the size: 96px image x 4 = 384px, 2.666px x 3 = 8px => 392px (x0.5333)
        &.bg-ch-swisstopo-swissimage {
            background-position: 0 0;
        }
        &.bg-ch-swisstopo-pixelkarte-grau {
            background-position: -98.6667px 0; // 96px (image) + 2.6667 (border)
        }
        &.bg-ch-swisstopo-pixelkarte-farbe {
            background-position: -197.3334px 0; // 192px (2 images) + 5.3334 (2 borders)
        }
        &.bg-ch-swisstopo-leichte-basiskarte_world-vt {
            background-position: -296px 0; // 288px (3 images) + 8 (3 borders)
        }

        &:hover {
            border-color: $red;
        }
    }

    .bg-selector-trigger {
        border-width: $menu-button-diameter;
        &:hover {
            border-color: $red;
        }
    }

    .bg-selector-button-label {
        display: block;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
    }

    .bg-selector-open {
        .bg-selector-wheel {
            left: calc(($desktop-map-button-width + $map-button-gap) * -1);
            bottom: 0;
        }
        $numberOfBackgrounds: 4;
        @for $i from 0 through $numberOfBackgrounds {
            .bg-index-#{$i} {
                $offset: calc(
                    ($desktop-map-button-width + $map-button-gap) * ($i - $numberOfBackgrounds)
                );
                transform: translateX($offset);
            }
        }

        .bg-selector-trigger {
            background-image: none;
            border-width: $menu-button-diameter;
            width: 40px;
            animation: none;
            .bg-selector-button-label {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
