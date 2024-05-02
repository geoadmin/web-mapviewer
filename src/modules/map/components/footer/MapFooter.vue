<script setup>
import { computed, onUpdated, ref, useSlots } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const slots = useSlots()

const isFullscreenMode = computed(() => store.state.ui.fullscreenMode)
const hasTopLeftFooter = ref(!!slots['top-left'])
const hasTopRightFooter = ref(!!slots['top-right'])
const hasBottomLeftFooter = ref(!!slots['bottom-left'])
const hasBottomRightFooter = ref(!!slots['bottom-right'])

onUpdated(() => {
    // Slots are not reactive therefore we need to update our checks based on the onUpdated
    // life cycle hook, using a computed would not work here.
    hasTopLeftFooter.value = !!slots['top-left']
    hasBottomLeftFooter.value = !!slots['bottom-left']
    hasBottomRightFooter.value = !!slots['bottom-right']
})
</script>

<template>
    <div
        class="map-footer"
        :class="{ 'map-footer-fullscreen': isFullscreenMode }"
        data-cy="app-footer"
    >
        <div v-if="hasTopLeftFooter || hasTopRightFooter" class="map-footer-top">
            <slot name="top-left" />
            <span v-if="hasTopRightFooter" class="map-footer-top-spacer" />
            <slot name="top-right" />
        </div>
        <div class="map-footer-middle">
            <slot name="middle" />
        </div>
        <div v-if="hasBottomLeftFooter || hasBottomRightFooter" class="map-footer-bottom">
            <slot name="bottom-left" @vue:updated="handleSlotChange" />
            <span v-if="hasBottomRightFooter" class="map-footer-bottom-spacer" />
            <slot name="bottom-right" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';

$transition-duration: 0.2s;
$flex-gap: 1em;

// Full screen and media query adjustments are at the end.

.map-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    transition: transform $transition-duration;
    pointer-events: none;

    &-top > *,
    &-middle,
    &-bottom {
        pointer-events: all;
    }

    &-top {
        position: relative;
        z-index: $zindex-footer;
        display: flex;
        align-items: flex-end;
        flex-direction: row;
        justify-content: space-between;

        &-spacer {
            flex-grow: 1;
        }
    }

    &-middle {
        position: relative;
        z-index: $zindex-footer;
        background-color: $white;
        @include respond-above(phone) {
            z-index: $zindex-desktop-footer-infobox;
        }
    }

    &-bottom {
        position: relative;
        z-index: $zindex-footer;
        width: 100%;
        padding: 0.6em;
        background-color: rgba($white, 0.9);
        font-size: 0.6rem;
        height: $footer-height;

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
