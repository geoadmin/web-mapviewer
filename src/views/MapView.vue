<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useStore } from 'vuex'

import HeaderModule from '@/modules/header/HeaderModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import BackgroundSelector from '@/modules/map/components/footer/backgroundSelector/BackgroundSelector.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAppVersion from '@/modules/map/components/footer/MapFooterAppVersion.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import MapFooterAppCopyright from '@/modules/map/components/footer/MapFooterCmsLink.vue'
import OpenLayersMouseTracker from '@/modules/map/components/openlayers/OpenLayersMouseTracker.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import TimeSlider from '@/modules/map/components/toolbox/TimeSlider.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import { UIModes } from '@/store/modules/ui.store'
import LoadingBar from '@/utils/components/LoadingBar.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import log from '@/utils/logging'

const DrawingModule = defineAsyncComponent(() => import('@/modules/drawing/DrawingModule.vue'))

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const isDrawingMode = computed(() => store.state.ui.showDrawingOverlay)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const isPhoneMode = computed(() => store.state.ui.mode === UIModes.PHONE)
const showLoadingBar = computed(() => store.getters.showLoadingBar)
const isFullScreenMode = computed(() => store.state.ui.fullscreenMode)

const showDrawingModule = computed(
    () =>
        (!activeKmlLayer.value || activeKmlLayer.value?.kmlData) &&
        isDrawingMode.value &&
        !is3DActive.value
)
const showHeaderModule = computed(() => !showDrawingModule.value && !isFullScreenMode.value)
const showMenuModule = computed(() => !showDrawingModule.value)
const showTimeSlider = computed(
    () => store.state.ui.isTimeSliderActive && !isDrawingMode.value && !isFullScreenMode.value
)
const showMapFooter = computed(() => !isPhoneMode.value && !isFullScreenMode.value)

onMounted(() => {
    log.info(`Map view mounted`)
})
</script>

<template>
    <div id="map-view">
        <LoadingBar v-show="showLoadingBar" />
        <HeaderModule v-if="showHeaderModule" class="header" />
        <MapModule>
            <template v-if="showDrawingModule" #header>
                <DrawingModule />
            </template>
            <template v-if="showMenuModule" #menu>
                <MenuModule :compact="!isPhoneMode" :show-backdrop-when-open="isPhoneMode" />
            </template>
            <template v-if="showTimeSlider" #time-slider>
                <TimeSlider class="time-slider" />
            </template>
            <template #toolbox>
                <MapToolbox
                    :geoloc-button="!isDrawingMode"
                    :full-screen-button="!isDrawingMode"
                    :toggle3d-button="!isDrawingMode"
                    :compass-button="!is3DActive"
                    :time-slider-button="!isDrawingMode"
                />
            </template>
            <template v-if="isPhoneMode" #bottom-left>
                <BackgroundSelector />
            </template>
            <template #bottom-right>
                <BackgroundSelector v-if="!isPhoneMode" class="me-1" />
                <MapFooterAttributionList />
            </template>
            <template v-if="showMapFooter" #footer>
                <MapFooter>
                    <template v-if="!is3DActive" #bottom-left>
                        <OpenLayersScale />
                        <OpenLayersMouseTracker class="d-none d-md-block" />
                    </template>
                    <template #bottom-right>
                        <TextTruncate><MapFooterAppVersion /></TextTruncate>
                        <MapFooterAppCopyright />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <I18nModule />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/scss/media-query.mixin';

#map-view {
    display: flex;
    flex-direction: column;
    .background-selector {
        pointer-events: all;
    }
    .header {
        position: relative;
        z-index: $zindex-menu-header;
    }
    .time-slider {
        z-index: $zindex-menu-tray;
        top: $screen-padding-for-ui-elements;
        left: 0;
        width: calc(100% - $map-button-diameter - $spacer);
    }
}

@include respond-above(lg) {
    #map-view {
        .time-slider {
            left: $menu-tray-width;
            transform: none;
            width: calc(100% - $map-button-diameter - $menu-tray-width - $spacer);
        }
    }
}
</style>
