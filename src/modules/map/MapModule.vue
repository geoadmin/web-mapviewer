<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'

import InfoboxModule from '@/modules/infobox/index.js'

import CompareSlider from './components/CompareSlider.vue'
import LocationPopup from './components/LocationPopup.vue'
import WarningRibbon from './components/WarningRibbon.vue'

const CesiumMap = defineAsyncComponent(() => import('./components/cesium/CesiumMap.vue'))
const OpenLayersMap = defineAsyncComponent(
    () => import('./components/openlayers/OpenLayersMap.vue')
)

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

const displayLocationPopup = computed(
    () => store.state.map.displayLocationPopup && !store.state.ui.embed
)
const isCompareSliderActive = computed(() => {
    return store.state.ui.isCompareSliderActive && store.getters.visibleLayerOnTop
})
</script>

<template>
    <div
        class="full-screen-map position-relative w-100 h-100 overflow-hidden d-flex flex-column"
        data-cy="map"
    >
        <CesiumMap v-if="is3DActive" class="flex-grow-1">
            <slot name="menu" />
            <!-- So that external modules can have access to the viewer instance through the provided 'cesiumViewer' -->
            <slot name="default" />
            <LocationPopup v-if="displayLocationPopup" />
            <slot name="footer" />
        </CesiumMap>
        <OpenLayersMap v-else :show-scale-line="isPhoneMode" class="flex-grow-1">
            <template #header>
                <slot name="header" />
            </template>
            <template #menu>
                <slot name="menu" />
            </template>
            <template #toolbox>
                <slot name="toolbox" />
            </template>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot name="default" />
            <LocationPopup v-if="displayLocationPopup" />
            <CompareSlider v-if="isCompareSliderActive" />
            <InfoboxModule class="infobox" />
            <template #footer>
                <slot name="footer" />
            </template>
        </OpenLayersMap>

        <WarningRibbon />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.full-screen-map {
    background: $white url('../../assets/grid.png');

    .infobox {
        z-index: $zindex-footer;
    }
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
