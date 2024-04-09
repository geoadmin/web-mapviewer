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
import ZoomInButton from '@/modules/map/components/toolbox/ZoomInButton.vue'
import ZoomOutButton from '@/modules/map/components/toolbox/ZoomOutButton.vue'

const props = defineProps({
    /** Add the fullscreen button */
    fullScreenButton: { type: Boolean, default: false },
    /** Add the geo location button */
    geolocButton: { type: Boolean, default: false },
    /** Add the 3D view button */
    toggle3dButton: { type: Boolean, default: false },
    /** Add the compass button (only available in 2D mode) */
    compassButton: { type: Boolean, default: false },
})
const { fullScreenButton, geolocButton, toggle3dButton, compassButton } = toRefs(props)

const store = useStore()

const isFullscreenMode = computed(() => store.state.ui.fullscreenMode)
const is3dActive = computed(() => store.state.cesium.active)
</script>

<template>
    <div class="toolbox-right d-flex flex-column" data-cy="toolbox-right">
        <FullScreenButton v-if="fullScreenButton" />
        <GeolocButton v-if="geolocButton && !isFullscreenMode" />
        <ZoomInButton v-if="!isFullscreenMode && !is3dActive" />
        <ZoomOutButton v-if="!isFullscreenMode && !is3dActive" />
        <Toggle3dButton v-if="toggle3dButton && !isFullscreenMode" />
        <OpenLayersCompassButton v-if="compassButton && !is3dActive && !isFullscreenMode" />
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.toolbox-right {
    // do not react to click event on the container (let them through to the map
    pointer-events: none;
    & > * {
        // but reacting to any click event "element" in the toolbox
        pointer-events: all;
    }
}
</style>