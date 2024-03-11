<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useStore } from 'vuex'

import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import BackgroundSelector from '@/modules/map/components/footer/backgroundSelector/BackgroundSelector.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAppCopyright from '@/modules/map/components/footer/MapFooterAppCopyright.vue'
import MapFooterAppVersion from '@/modules/map/components/footer/MapFooterAppVersion.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import OpenLayersMouseTracker from '@/modules/map/components/openlayers/OpenLayersMouseTracker.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import TimeSliderButton from '@/modules/map/components/toolbox/TimeSliderButton.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import { UIModes } from '@/store/modules/ui.store'
import log from '@/utils/logging'

const DrawingModule = defineAsyncComponent(() => import('@/modules/drawing/DrawingModule.vue'))

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const isDrawingMode = computed(() => store.state.ui.showDrawingOverlay)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const isPhoneMode = computed(() => store.state.ui.mode === UIModes.PHONE)

const loadDrawingModule = computed(() => {
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
        <MapModule>
            <MenuModule />
            <MapToolbox
                :geoloc-button="!isDrawingMode"
                :full-screen-button="!isDrawingMode"
                :toggle3d-button="!isDrawingMode"
                compass-button
            >
                <TimeSliderButton v-if="!isDrawingMode" />
            </MapToolbox>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule v-if="loadDrawingModule" />
            <template #footer>
                <MapFooter>
                    <template v-if="isPhoneMode" #top-left>
                        <div class="d-flex flex-column align-items-start">
                            <BackgroundSelector class="p-2 background-selector" />
                            <OpenLayersScale v-if="!is3DActive" class="p-1" />
                        </div>
                    </template>
                    <template #top-right>
                        <div class="d-flex flex-column align-items-end">
                            <BackgroundSelector
                                v-if="!isPhoneMode"
                                class="p-2 background-selector"
                            />
                            <MapFooterAttributionList class="rounded-top-2 rounded-end-0" />
                        </div>
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                    <template v-if="!is3DActive && !isPhoneMode" #bottom-left>
                        <OpenLayersScale />
                        <OpenLayersMouseTracker />
                    </template>
                    <template v-if="!isPhoneMode" #bottom-right>
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
#map-view {
    .background-selector {
        pointer-events: all;
    }
}
</style>
