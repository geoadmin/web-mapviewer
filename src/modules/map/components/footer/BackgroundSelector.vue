<script setup>
import BackgroundSelectorEntry from '@/modules/map/components/footer/BackgroundSelectorEntry.vue'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const showSelector = ref(false)
const animate = ref(false)

const store = useStore()
const backgroundLayers = computed(() => store.getters.backgroundLayers)
const currentBackgroundLayer = computed(() => store.state.layers.currentBackgroundLayer)
const spreadHorizontally = computed(() => store.getters.isDesktopMode)

const backgroundLayersWithVoid = computed(() => [...backgroundLayers.value, null])

function selectBackground(backgroundLayer) {
    store.dispatch('setBackground', backgroundLayer)
    toggleShowSelector()
}
function toggleShowSelector() {
    showSelector.value = !showSelector.value

    animate.value = true
    // waiting a short time, so that the animation can kick in, them remove the flag
    setTimeout(() => {
        animate.value = false
    }, 100)
}
</script>

<template>
    <div v-if="backgroundLayers.length > 0" class="bg-selector" data-cy="background-selector">
        <div
            class="bg-selector-wheel"
            :class="{ show: showSelector, animate, 'horizontal-spread': spreadHorizontally }"
        >
            <BackgroundSelectorEntry
                v-for="(backgroundLayer, index) in backgroundLayersWithVoid"
                :key="index"
                :class="`bg-selector-wheel-item-${index}`"
                class="bg-selector-wheel-item"
                :background-layer="backgroundLayer"
                :active="backgroundLayer?.getID() === currentBackgroundLayer?.getID()"
                :title="backgroundLayer?.name"
                with-tooltip
                :tooltip-position="spreadHorizontally ? 'top' : 'left'"
                @click="selectBackground(backgroundLayer)"
            />
        </div>
        <BackgroundSelectorEntry
            :background-layer="currentBackgroundLayer"
            thick-border
            :pulse-border="animate"
            @click="toggleShowSelector"
        />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.bg-selector {
    position: relative;

    // Setup the wheel container so that BG are hidden and stacked together, ready to be spread
    &-wheel {
        $transition-duration: 0.3s;
        display: none;
        opacity: 0;
        &,
        &-item {
            transition-duration: $transition-duration;
            position: absolute;
        }
        &.horizontal-spread,
        &.horizontal-spread &-item {
            transition-property: right, opacity;
            right: 0;
        }
        &:not(.horizontal-spread),
        &:not(.horizontal-spread) &-item {
            transition-property: bottom, opacity;
            bottom: 0;
        }
        z-index: $zindex-map + 1;

        $map-button-gap: 4px;
        $nb-max-bg: 10;
        &.show,
        &.animate {
            display: block;
        }
        &.show:not(.animate) {
            opacity: 1;
            &:not(.horizontal-spread) {
                bottom: $map-button-diameter + 2 * $map-button-gap;
                @for $i from 0 through $nb-max-bg {
                    .bg-selector-wheel-item-#{$i} {
                        bottom: calc(($map-button-diameter + $map-button-gap) * $i);
                    }
                }
            }
            &.horizontal-spread {
                right: $map-button-diameter + 2 * $map-button-gap;
                @for $i from 0 through $nb-max-bg {
                    .bg-selector-wheel-item-#{$i} {
                        right: calc(($map-button-diameter + $map-button-gap) * $i);
                    }
                }
            }
        }
        &:not(.show).animate {
            &:not(.horizontal-spread) .bg-selector-wheel-item {
                bottom: 0;
            }
            &.horizontal-spread .bg-selector-wheel-item {
                right: 0;
            }
        }
    }
}
</style>
