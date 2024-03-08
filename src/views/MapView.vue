<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useStore } from 'vuex'

import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import log from '@/utils/logging'

const DrawingModule = defineAsyncComponent(() => import('@/modules/drawing/DrawingModule.vue'))

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const isDrawing = computed(() => store.state.ui.showDrawingOverlay)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)

const loadDrawingModule = computed(() => {
    return (
        (!activeKmlLayer.value || activeKmlLayer.value?.kmlData) &&
        isDrawing.value &&
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
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule v-if="loadDrawingModule" />
            <!-- Needed to be able to set an overlay when hovering over the profile with the mouse -->
            <InfoboxModule />
        </MapModule>
        <MapFooter />
        <MenuModule />
        <I18nModule />
    </div>
</template>
