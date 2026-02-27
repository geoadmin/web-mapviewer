<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import CesiumMouseTracker from '@/modules/map/components/cesium/CesiumMouseTracker.vue'
import BackgroundSelector from '@/modules/map/components/footer/backgroundSelector/BackgroundSelector.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAppCopyright from '@/modules/map/components/footer/MapFooterAppCopyright.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import OpenLayersMouseTracker from '@/modules/map/components/openlayers/OpenLayersMouseTracker.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import TimeSliderButton from '@/modules/map/components/toolbox/TimeSliderButton.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import useCesiumStore from '@/store/modules/cesium'
import useDrawingStore from '@/store/modules/drawing'
import useUIStore from '@/store/modules/ui'
import AppVersion from '@/utils/components/AppVersion.vue'
import DragDropOverlay from '@/utils/components/DragDropOverlay.vue'
import LoadingBar from '@/utils/components/LoadingBar.vue'
import OfflineReadinessStatus from '@/utils/offline/OfflineReadinessStatus.vue'

const DrawingModule = defineAsyncComponent(() => import('@/modules/drawing/DrawingModule.vue'))

const cesiumStore = useCesiumStore()
const uiStore = useUIStore()
const drawingStore = useDrawingStore()

const loadDrawingModule = computed<boolean>(() => drawingStore.overlay.show && !cesiumStore.active)
</script>

<template>
    <div class="view no-print">
        <LoadingBar v-show="uiStore.showLoadingBar" />
        <MapModule>
            <MenuModule />
            <MapToolbox
                geoloc-button
                :full-screen-button="!drawingStore.overlay.show"
                :toggle3d-button="!drawingStore.overlay.show"
                compass-button
            >
                <TimeSliderButton v-if="!cesiumStore.active" />
            </MapToolbox>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule v-if="loadDrawingModule" />
            <template #footer>
                <MapFooter>
                    <template
                        v-if="uiStore.isPhoneMode"
                        #top-left
                    >
                        <div class="d-flex flex-column align-items-start">
                            <BackgroundSelector class="background-selector p-2" />
                            <OpenLayersScale
                                v-if="!cesiumStore.active"
                                class="p-1"
                            />
                        </div>
                    </template>
                    <template #top-right>
                        <div class="d-flex flex-column align-items-end">
                            <BackgroundSelector
                                v-if="!uiStore.isPhoneMode"
                                class="background-selector p-2"
                            />
                            <MapFooterAttributionList class="rounded-top-2 rounded-end-0" />
                        </div>
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                    <template
                        v-if="!uiStore.isPhoneMode"
                        #bottom-left
                    >
                        <template v-if="!cesiumStore.active">
                            <OpenLayersScale />
                            <OpenLayersMouseTracker />
                        </template>
                        <template v-if="cesiumStore.active">
                            <CesiumMouseTracker />
                        </template>
                    </template>
                    <template
                        v-if="!uiStore.isPhoneMode"
                        #bottom-right
                    >
                        <AppVersion />
                        <MapFooterAppCopyright />
                        <OfflineReadinessStatus v-if="!IS_TESTING_WITH_CYPRESS" />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <DragDropOverlay v-if="uiStore.showDragAndDropOverlay" />
    </div>
</template>

<style lang="scss" scoped>
#map-view {
    .background-selector {
        pointer-events: all;
    }
}
</style>
