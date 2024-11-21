<script setup>
import useBackgroundSelector from '@/modules/map/components/footer/backgroundSelector/useBackgroundSelector'
import useBackgroundLayerProps from '@/modules/map/components/footer/backgroundSelector/useBackgroundSelectorProps'

const { backgroundLayers, currentBackgroundLayer } = defineProps(useBackgroundLayerProps())

const emit = defineEmits({
    selectBackground: (backgroundLayer) => {
        return backgroundLayer === null || typeof backgroundLayer === 'string'
    },
})

const { show, animate, getImageForBackgroundLayer, toggleShowSelector, onSelectBackground } =
    useBackgroundSelector(backgroundLayers, currentBackgroundLayer, emit)
</script>

<template>
    <div class="bg-selector-rounded">
        <div class="bg-selector-rounded-wheel" :class="{ show, animate }">
            <button
                v-for="(backgroundLayer, index) in backgroundLayers"
                :key="index"
                class="bg-selector-rounded-wheel-button"
                :class="[
                    { active: backgroundLayer?.id === currentBackgroundLayer?.id },
                    `bg-selector-rounded-wheel-button-${index}`,
                ]"
                type="button"
                :data-cy="`background-selector-${backgroundLayer?.id || 'void'}`"
                @click="onSelectBackground(backgroundLayer?.id || null)"
            >
                <span class="bg-selector-rounded-wheel-button-image-cropper">
                    <img
                        v-if="backgroundLayer"
                        :src="getImageForBackgroundLayer(backgroundLayer)"
                        alt="background image"
                        class="rounded-5"
                    />
                </span>
            </button>
        </div>
        <button
            class="bg-selector-rounded-wheel-button thick"
            :class="{ active: show, pulse: animate }"
            type="button"
            data-cy="background-selector-open-wheel-button"
            @click="toggleShowSelector"
        >
            <span class="bg-selector-rounded-wheel-button-image-cropper">
                <img
                    :src="getImageForBackgroundLayer(currentBackgroundLayer)"
                    alt="background image"
                    class="rounded-5"
                />
            </span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import './bg-selector';

$main-component: '.bg-selector-rounded';
$rounded-button-width: $map-button-diameter;

@include setup-background-buttons($main-component, $rounded-button-width, 1);
@include spread-wheel-buttons($main-component, $rounded-button-width, bottom);

#{$main-component} {
    &-wheel-button {
        border-radius: 50%;

        &-image-cropper {
            border-radius: 50%;
            img {
                transform: scale(0.7) translate(-38%, -66%);
            }
        }
    }
}
</style>
