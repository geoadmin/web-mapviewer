<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isFullscreenMode = computed(() => store.state.ui.fullscreenMode)
</script>

<template>
    <div
        class="map-footer bg-light w-100 d-flex gap-2 shadow align-items-stretch"
        :class="{ 'map-footer-fullscreen': isFullscreenMode }"
        data-cy="app-footer"
    >
        <div class="map-footer-left d-flex justify-content-start align-items-center gap-1">
            <slot name="bottom-left" />
        </div>
        <div
            class="map-footer-right d-flex flex-grow-1 justify-content-end align-items-center gap-1"
        >
            <slot name="bottom-right" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/webmapviewer-bootstrap-theme';

$transition-duration: 0.2s;
$flex-gap: 1em;

// Full screen and media query adjustments are at the end.

.map-footer {
    transition: transform $transition-duration;
    z-index: $zindex-footer;
    font-size: 0.6rem;
    justify-content: stretch;
    padding: 0.1rem;

    &-bottom {
        position: relative;
        z-index: $zindex-footer;
        width: 100%;
        padding: 0.6em;
        background-color: rgba($white, 0.9);
        font-size: 0.6rem;

        display: flex;
        align-items: center;
        gap: 0 $flex-gap;
        flex-wrap: wrap;

        &-spacer {
            flex-grow: 1;
        }
    }
}

.map-footer-fullscreen {
    transform: translateY(100%);

    .map-footer-top-left {
        // Translation is needed if the background selection wheel is open.
        transform: translateX(-100%);
    }
}
</style>
