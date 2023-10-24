<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'

import OpenLayersCompassButton from '@/modules/map/components/openlayers/OpenLayersCompassButton.vue'
import OpenLayersMouseTracker from '@/modules/map/components/openlayers/OpenLayersMouseTracker.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import { UIModes } from '@/store/modules/ui.store'

import CompareSlider from './components/CompareSlider.vue'
import LocationPopup from './components/LocationPopup.vue'
import WarningRibbon from './components/WarningRibbon.vue'
const CesiumMap = defineAsyncComponent(() => import('./components/cesium/CesiumMap.vue'))
const OpenLayersMap = defineAsyncComponent(
    () => import('./components/openlayers/OpenLayersMap.vue')
)

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const uiMode = computed(() => store.state.ui.mode)
const displayLocationPopup = computed(() => store.state.map.displayLocationPopup)

const isPhoneMode = computed(() => uiMode.value === UIModes.PHONE)
</script>

<template>
    <div class="full-screen-map" data-cy="map">
        <CesiumMap v-if="is3DActive">
            <!-- So that external modules can have access to the viewer instance through the provided 'getViewer' -->
            <slot />
            <LocationPopup v-if="displayLocationPopup" />
        </CesiumMap>
        <OpenLayersMap v-else>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
            <LocationPopup v-if="displayLocationPopup" />
            <teleport :to="`#map-footer-${isPhoneMode ? 'mobile-' : ''}scale-line`">
                <OpenLayersScale />
            </teleport>
            <teleport to="#map-footer-mouse-tracker">
                <OpenLayersMouseTracker />
            </teleport>
            <teleport to="#toolbox-compass-button">
                <OpenLayersCompassButton />
            </teleport>
            <CompareSlider v-if="isCompareSliderActive" />
        </OpenLayersMap>

        <WarningRibbon />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.full-screen-map {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $white url('../../assets/grid.png');
}
.slide-down-leave-active,
.slide-down-enter-active {
    transition: 0.2s;
}
.slide-down-enter {
    transform: translate(0, 100%);
}
.slide-down-leave-to {
    transform: translate(0, 100%);
}
</style>
