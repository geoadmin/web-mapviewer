<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useStore } from 'vuex'

import HeaderModule from '@/modules/header/HeaderModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAppCopyright from '@/modules/map/components/footer/MapFooterAppCopyright.vue'
import MapFooterAppVersion from '@/modules/map/components/footer/MapFooterAppVersion.vue'
import OpenLayersMouseTracker from '@/modules/map/components/openlayers/OpenLayersMouseTracker.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import TimeSliderButton from '@/modules/map/components/toolbox/TimeSliderButton.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import { UIModes } from '@/store/modules/ui.store'
import LoadingBar from '@/utils/components/LoadingBar.vue'
import log from '@/utils/logging'

const DrawingModule = defineAsyncComponent(() => import('@/modules/drawing/DrawingModule.vue'))

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const isDrawingMode = computed(() => store.state.ui.showDrawingOverlay)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const isPhoneMode = computed(() => store.state.ui.mode === UIModes.PHONE)
const showLoadingBar = computed(() => store.getters.showLoadingBar)

const showDrawingModule = computed(() => {
    return (
        (!activeKmlLayer.value || activeKmlLayer.value?.kmlData) &&
        isDrawingMode.value &&
        !is3DActive.value
    )
})

onMounted(() => {
    log.info(`Map view mounted`)
})
</script>

<template>
    <div id="map-view">
        <LoadingBar v-show="showLoadingBar" />
        <HeaderModule v-if="!showDrawingModule" class="header" />
        <MapModule>
            <template #header>
                <DrawingModule v-if="showDrawingModule" />
            </template>
            <template #menu>
                <MenuModule
                    v-if="!showDrawingModule"
                    :compact="!isPhoneMode"
                    :show-backdrop-when-open="isPhoneMode"
                />
            </template>
            <template #toolbox>
                <MapToolbox
                    :geoloc-button="!isDrawingMode"
                    :full-screen-button="!isDrawingMode"
                    :toggle3d-button="!isDrawingMode"
                    compass-button
                >
                    <TimeSliderButton v-if="!isDrawingMode" />
                </MapToolbox>
            </template>
            <template v-if="!isPhoneMode" #footer>
                <MapFooter>
                    <template v-if="!is3DActive" #bottom-left>
                        <OpenLayersScale />
                        <OpenLayersMouseTracker />
                    </template>
                    <template #bottom-right>
                        <MapFooterAppVersion />
                        <MapFooterAppCopyright />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <I18nModule />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables';

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
}
</style>
