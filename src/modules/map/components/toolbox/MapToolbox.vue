<script setup>
/**
 * MapToolbox component contains some basic map tool that are displayed as button on the top right
 * map corner.
 *
 * By default the toolbox only contains the zoom in/out buttons
 */
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
import FullScreenButton from '@/modules/map/components/toolbox/FullScreenButton.vue'
import GeolocButton from '@/modules/map/components/toolbox/GeolocButton.vue'
import Toggle3dButton from '@/modules/map/components/toolbox/Toggle3dButton.vue'
import ZoomButtons from '@/modules/map/components/toolbox/ZoomButtons.vue'

const props = defineProps({
    /**
     * Tell the component if the map has a header, if set to true the buttons will be put right
     * below the header
     */
    hasHeader: { type: Boolean, default: true },
    /** Add the fullscreen button */
    fullScreenButton: { type: Boolean, default: false },
    /** Add the geo location button */
    geolocButton: { type: Boolean, default: false },
    /** Add the 3D view button */
    toggle3dButton: { type: Boolean, default: false },
    /** Add the compass button (only available in 2D mode) */
    compassButton: { type: Boolean, default: false },
})
const { fullScreenButton, geolocButton, toggle3dButton, compassButton, hasHeader } = toRefs(props)

const store = useStore()

const isFullscreenMode = computed(() => store.state.ui.fullscreenMode)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isDrawingMode = computed(() => store.state.ui.showDrawingOverlay)
const is3dActive = computed(() => store.state.cesium.active)
</script>

<template>
    <div
        class="toolbox-right m-2 position-absolute end-0"
        :class="{
            'dev-disclaimer-present': hasDevSiteWarning,
            'fullscreen-mode': isFullscreenMode || !hasHeader,
            'drawing-mode': isDrawingMode,
        }"
        data-cy="toolbox-right"
    >
        <FullScreenButton v-if="fullScreenButton" />
        <GeolocButton v-if="geolocButton && !isFullscreenMode" />
        <ZoomButtons v-if="!isFullscreenMode && !is3dActive" />
        <Toggle3dButton v-if="toggle3dButton && !isFullscreenMode" />
        <OpenLayersCompassButton v-if="compassButton && !is3dActive && !isFullscreenMode" />
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

.toolbox-right {
    z-index: $zindex-map-toolbox;
    top: $header-height;
    &.dev-disclaimer-present {
        top: $header-height + $dev-disclaimer-height;
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
            top: 2 * $header-height + $dev-disclaimer-height;
        }
        &.drawing-mode,
        &.dev-disclaimer-present.drawing-mode {
            top: $header-height;
        }
    }
}
</style>
