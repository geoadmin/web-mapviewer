<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

import CompareSlider from '@/modules/map/components/CompareSlider.vue'
import LocationPopup from '@/modules/map/components/LocationPopup.vue'
import WarningRibbon from '@/modules/map/components/WarningRibbon.vue'
import useCesiumStore from '@/store/modules/cesium'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import useUIStore from '@/store/modules/ui'

const CesiumMap = defineAsyncComponent(() => import('./components/cesium/CesiumMap.vue'))
const OpenLayersMap = defineAsyncComponent(
    () => import('./components/openlayers/OpenLayersMap.vue')
)

const cesiumStore = useCesiumStore()
const layersStore = useLayersStore()
const mapStore = useMapStore()
const uiStore = useUIStore()

const displayLocationPopup = computed<boolean>(
    () => !!mapStore.locationPopupCoordinates && !uiStore.embed
)
const isCompareSliderActive = computed<boolean>(
    () => uiStore.isCompareSliderActive && !!layersStore.visibleLayerOnTop
)
</script>
<template>
    <div
        class="full-screen-map"
        data-cy="map"
    >
        <!-- <CesiumMap v-if="true"> -->
        <CesiumMap v-if="cesiumStore.active">
            <!-- So that external modules can have access to the viewer instance through the provided 'getViewer' -->
            <slot />
            <LocationPopup v-if="displayLocationPopup" />
            <slot name="footer" />
        </CesiumMap>
        <OpenLayersMap v-else>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
            <LocationPopup v-if="displayLocationPopup" />
            <CompareSlider v-if="isCompareSliderActive" />
            <slot name="footer" />
        </OpenLayersMap>

        <WarningRibbon />
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';

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
