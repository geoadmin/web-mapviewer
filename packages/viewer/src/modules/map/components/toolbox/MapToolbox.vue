<script setup lang="ts">
/**
 * MapToolbox component contains some basic map tool that are displayed as button on the top right
 * map corner.
 *
 * By default the toolbox only contains the zoom in/out buttons
 */
import { computed } from 'vue'

import FullScreenButton from '@/modules/map/components/toolbox/FullScreenButton.vue'
import GeolocButton from '@/modules/map/components/toolbox/GeolocButton.vue'
import Toggle3dButton from '@/modules/map/components/toolbox/Toggle3dButton.vue'
import ZoomButtons from '@/modules/map/components/toolbox/ZoomButtons.vue'
import useUIStore from '@/store/modules/ui.store'
import useDrawingStore from '@/store/modules/drawing.store'

const {
    fullScreenButton = false,
    geolocButton = false,
    toggle3dButton = false,
    compassButton = false,
    /**
     * Tell the component if the map has a header, if set to true the buttons will be put right
     * below the header
     */
    hasHeader = true,
} = defineProps<{
    fullScreenButton?: boolean
    geolocButton?: boolean
    toggle3dButton?: boolean
    compassButton?: boolean
    hasHeader?: boolean
}>()

const uiStore = useUIStore()
const drawingStore = useDrawingStore()

const isFullscreenMode = computed(() => uiStore.fullscreenMode)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)
const isDrawingMode = computed(() => drawingStore.drawingOverlay.show)
</script>

<template>
    <div
        class="toolbox-right position-absolute end-0 m-2"
        :class="{
            'dev-disclaimer-present': hasDevSiteWarning,
            'fullscreen-mode': isFullscreenMode || !hasHeader,
            'drawing-mode': isDrawingMode,
        }"
        data-cy="toolbox-right"
    >
        <FullScreenButton v-if="fullScreenButton" />
        <GeolocButton
            v-if="geolocButton"
            :compass-button="compassButton"
        />
        <ZoomButtons />
        <Toggle3dButton v-if="toggle3dButton" />
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

.toolbox-right {
    z-index: $zindex-map-toolbox;
    top: $header-height;
    &.dev-disclaimer-present {
        top: calc($header-height + $dev-disclaimer-height);
    }
    &.fullscreen-mode,
    &.dev-disclaimer-present.fullscreen-mode {
        top: 0;
    }
    &.drawing-mode,
    &.dev-disclaimer-present.drawing-mode {
        top: $drawing-tools-height-mobile;
    }
}

@include respond-above(lg) {
    .toolbox-right {
        top: 2 * $header-height;
        &.dev-disclaimer-present {
            top: calc(2 * $header-height + $dev-disclaimer-height);
        }
        &.drawing-mode,
        &.dev-disclaimer-present.drawing-mode {
            top: $header-height;
        }
    }
}

.hide-on-mobile {
    @include respond-below(phone) {
        display: none;
    }
}
</style>
