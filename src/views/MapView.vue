<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

import DrawingModule from '@/modules/drawing/DrawingModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import OpenFullAppLink from '@/utils/components/OpenFullAppLink.vue'
import log from '@/utils/logging'

const store = useStore()

const embedded = computed(() => store.state.ui.embeddedMode)
const is3DActive = computed(() => store.state.cesium.active)
const isDrawing = computed(() => store.state.ui.showDrawingOverlay)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const isAppReady = computed(() => store.state.app.isReady)

const loadDrawingModule = computed(() => {
    return (
        (!activeKmlLayer.value || activeKmlLayer.value?.kmlData) &&
        isDrawing.value &&
        !is3DActive.value &&
        !embedded.value
    )
})

onMounted(() => {
    log.info(`Map view mounted`)
})
</script>

<template>
    <div id="map-view">
        <OpenFullAppLink v-if="embedded" />
        <MapModule>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule v-if="loadDrawingModule" />
            <!-- Needed to be able to set an overlay when hovering over the profile with the mouse -->
            <InfoboxModule />
        </MapModule>
        <MapFooter v-show="!embedded" />
        <MenuModule v-if="!embedded && isAppReady" />
        <I18nModule />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables.scss';
#map-view {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
