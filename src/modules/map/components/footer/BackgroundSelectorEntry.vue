<script setup>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import tippy from 'tippy.js'
import { computed, defineProps, onBeforeUnmount, onMounted, ref } from 'vue'

const { backgroundLayer, withTooltip, tooltipPosition, thickBorder, pulseBorder, title } =
    defineProps({
        backgroundLayer: {
            type: AbstractLayer,
            default: null,
        },
        withTooltip: {
            type: Boolean,
            default: false,
        },
        tooltipPosition: {
            type: String,
            default: 'left',
        },
        active: {
            type: Boolean,
            default: false,
        },
        thickBorder: {
            type: Boolean,
            default: false,
        },
        pulseBorder: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: null,
        },
    })

const backgroundLayerId = computed(() => {
    if (backgroundLayer) {
        return backgroundLayer.getID()
    }
    return 'void_layer'
})

function getImageForBackgroundLayer(backgroundLayer) {
    return new URL(`../../assets/${backgroundLayer.getID()}.png`, import.meta.url).href
}

const tippyAnchor = ref(null)
const tippyContent = ref(null)

let tippyInstance
if (withTooltip) {
    onMounted(() => {
        console.log('with tooltip', tippyAnchor, tippyContent)
        tippyInstance = tippy(tippyAnchor.value, {
            theme: 'dark',
            content: tippyContent.value,
            arrow: true,
            placement: tooltipPosition,
            touch: false,
        })
    })
    onBeforeUnmount(() => {
        tippyInstance?.destroy()
    })
}
</script>

<template>
    <button
        ref="tippyAnchor"
        class="bg-selector-button"
        :class="{ active, thick: thickBorder, pulse: pulseBorder }"
        type="button"
        :data-cy="`background-selector-${backgroundLayerId}`"
    >
        <span class="bg-selector-button-image-cropper">
            <img
                v-if="backgroundLayer"
                :src="getImageForBackgroundLayer(backgroundLayer)"
                alt="background image"
                class="rounded-5"
            />
        </span>
        <span v-if="withTooltip" ref="tippyContent" class="bg-selector-button-label text-wrap">
            {{ $t(title || backgroundLayerId) }}
        </span>
    </button>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$transition-duration: 0.3s;
$bg-selector-button-border: 4px;
$bg-selector-button-thick-border: 7px;

.bg-selector-button {
    height: $map-button-diameter;
    width: $map-button-diameter;
    transition: width $transition-duration;
    padding: 0;
    border-radius: 50%;

    border: $bg-selector-button-border solid $map-button-border-color;
    &:hover,
    &.active {
        border-color: $primary;
    }
    &.thick {
        border: $bg-selector-button-thick-border solid $map-button-border-color;
    }
    &.thick &-image-cropper {
        $thick-cropper-size: $map-button-diameter - 2 * $bg-selector-button-thick-border;
        width: $thick-cropper-size;
        height: $thick-cropper-size;
    }
    &-image-cropper {
        $cropper-size: $map-button-diameter - 2 * $bg-selector-button-border;
        width: $cropper-size;
        height: $cropper-size;
        display: block;
        position: relative;
        overflow: hidden;
        margin: 0;
        padding: 0;
        border-radius: 50%;
        background: $white url('../../assets/void.png');

        img {
            display: inline;
            margin: 0 auto;
            height: 100%;
            width: auto;
        }
    }

    @keyframes pulse {
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
    &.pulse {
        animation-name: pulse;
        animation-timing-function: ease-in-out;
        animation-duration: $transition-duration;
    }
}
</style>
