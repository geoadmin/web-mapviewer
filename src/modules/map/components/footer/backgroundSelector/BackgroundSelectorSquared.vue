<script setup>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import useBackgroundSelector from '@/modules/map/components/footer/backgroundSelector/useBackgroundSelector'
import useBackgroundLayerProps from '@/modules/map/components/footer/backgroundSelector/useBackgroundSelectorProps'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { backgroundLayers, currentBackgroundLayer } = defineProps(useBackgroundLayerProps())

const emit = defineEmits({
    selectBackground: (backgroundLayer) => {
        return backgroundLayer === null || backgroundLayer instanceof AbstractLayer
    },
})

const { show, animate, getImageForBackgroundLayer, toggleShowSelector, onSelectBackground } =
    useBackgroundSelector(backgroundLayers, currentBackgroundLayer, emit)
</script>

<template>
    <div class="bg-selector-squared">
        <div class="bg-selector-squared-wheel" :class="{ show, animate }">
            <button
                v-for="(backgroundLayer, index) in backgroundLayers"
                :key="index"
                class="bg-selector-squared-wheel-button"
                :class="[
                    { active: backgroundLayer?.getID() === currentBackgroundLayer?.getID() },
                    `bg-selector-squared-wheel-button-${index}`,
                ]"
                type="button"
                :data-cy="`background-selector-${backgroundLayer?.getID() || 'void'}`"
                @click="onSelectBackground(backgroundLayer)"
            >
                <span class="bg-selector-squared-wheel-button-image-cropper">
                    <img
                        v-if="backgroundLayer"
                        :src="getImageForBackgroundLayer(backgroundLayer)"
                        alt="background image"
                    />
                </span>
                <span
                    class="bg-selector-squared-wheel-button-label text-bg-dark bg-opacity-75 show"
                >
                    {{ $t(backgroundLayer?.getID() || 'void_layer') }}
                </span>
            </button>
        </div>
        <button
            class="bg-selector-squared-wheel-button position-relative"
            :class="{ opened: show, 'text-bg-secondary': show, animate }"
            type="button"
            data-cy="background-selector-open-wheel-button"
            @click="toggleShowSelector"
        >
            <FontAwesomeIcon
                icon="circle-chevron-right"
                class="bg-selector-squared-wheel-button-close"
                :class="{ show, animate }"
            />
            <span class="bg-selector-squared-wheel-button-image-cropper">
                <img
                    :src="getImageForBackgroundLayer(currentBackgroundLayer)"
                    alt="background image"
                />
            </span>
            <span
                :class="{ spread: show, animate }"
                class="bg-selector-squared-wheel-button-label text-bg-dark bg-opacity-75"
            >
                <span
                    class="text-nowrap bg-selector-squared-wheel-button-label-inner"
                    :class="{ show: !show, animate }"
                >
                    {{ $t('bg_chooser_label') }}
                </span>
            </span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@import './bg-selector';

$main-element: '.bg-selector-squared';
$square-button-width: 98px;
$square-button-radius: 8px;

// assets have been sized to have a 4:3 ratio, so we can adapt "squared" button to have this exact ratio
@include setup-background-buttons($main-element, $square-button-width, math.div(3, 4));
@include spread-wheel-buttons($main-element, $square-button-width, right);

#{$main-element} {
    &-wheel-button {
        $opened-width: calc($square-button-width / 2.5);
        $cropper-opened-width: calc($opened-width - 2 * $bg-selector-button-border);
        border-radius: $square-button-radius;
        &.opened {
            width: $opened-width;
        }
        &.opened &-image-cropper {
            width: $cropper-opened-width;
        }
        &:not(.show).animate {
            // keeping the cropper at the shorten width in order to trigger the grow animation
            &-image-cropper {
                width: $cropper-opened-width;
            }
        }
        transition: width $bg-selector-transition-duration;
        $inner-radius: calc($square-button-radius - $bg-selector-button-border);
        &-image-cropper {
            border-radius: $inner-radius;
            transition: all $bg-selector-transition-duration;
            img {
                // arbitrary scale/translate so that something "nice" is shown in the cropper
                transform: scale(0.8) translate(-22%, -50%);
            }
        }
        &-close {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 1;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity $bg-selector-transition-duration;
            &.show {
                opacity: 1;
            }
        }
        &-label {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 0.75rem;
            opacity: 1;
            transition:
                opacity $bg-selector-transition-duration,
                height $bg-selector-transition-duration;
            // we only wants the bottom to have a rounded border to match the container
            // somehow it was necessary to reduce the radius of the label of 1px (average) to make
            // it cover fully the rounded spot
            $label-radius: calc($inner-radius - 1px);
            border-radius: 0 0 $label-radius $label-radius;

            &-inner {
                transition: opacity $bg-selector-transition-duration;
                opacity: 0;
                &.show {
                    opacity: 1;
                }
            }
            &.spread.animate {
                // fixing the height at animation start, so that it can then spread to 100%
                // (otherwise it jumps straight to 100% without animating)
                height: 1.1rem;
            }
            &.spread {
                height: 100%;
                // when spread, the top part of the label will touch the top of the container
                // so we also round the top part of the label
                border-radius: $label-radius;
            }
        }
    }
}
</style>
