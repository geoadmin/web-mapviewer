<script setup>
import Map from 'ol/Map'
import { get as getProjection } from 'ol/proj'
import { computed, onMounted, provide, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import useOnMapResize from '@/modules/map/components/common/useOnMapResize.composable'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import OpenLayersLayerExtents from '@/modules/map/components/openlayers/debug/OpenLayersLayerExtents.vue'
import OpenLayersTileDebugInfo from '@/modules/map/components/openlayers/debug/OpenLayersTileDebugInfo.vue'
import OpenLayersBackgroundLayer from '@/modules/map/components/openlayers/OpenLayersBackgroundLayer.vue'
import OpenLayersCrossHair from '@/modules/map/components/openlayers/OpenLayersCrossHair.vue'
import OpenLayersGeolocationFeedback from '@/modules/map/components/openlayers/OpenLayersGeolocationFeedback.vue'
import OpenLayersHighlightedFeature from '@/modules/map/components/openlayers/OpenLayersHighlightedFeatures.vue'
import OpenLayersPinnedLocation from '@/modules/map/components/openlayers/OpenLayersPinnedLocation.vue'
import OpenLayersRectangleSelectionFeedback from '@/modules/map/components/openlayers/OpenLayersRectangleSelectionFeedback.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import OpenLayersVisibleLayers from '@/modules/map/components/openlayers/OpenLayersVisibleLayers.vue'
import useMapInteractions from '@/modules/map/components/openlayers/utils/useMapInteractions.composable'
import usePrintAreaRenderer from '@/modules/map/components/openlayers/utils/usePrintAreaRenderer.composable'
import useViewBasedOnProjection from '@/modules/map/components/openlayers/utils/useViewBasedOnProjection.composable'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'OpenLayersMap.vue' }

const props = defineProps({
    showScaleLine: {
        type: Boolean,
        default: false,
    },
})
const { showScaleLine } = toRefs(props)

// setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
// this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
allCoordinateSystems
    .filter((projection) => projection.bounds && projection.epsg !== WGS84.epsg)
    .forEach((projection) => {
        const olProjection = getProjection(projection.epsg)
        olProjection?.setExtent(projection.bounds.flatten)
    })

const mapElement = ref(null)

const store = useStore()
const showTileDebugInfo = computed(() => store.state.debug.showTileDebugInfo)
const showLayerExtents = computed(() => store.state.debug.showLayerExtents)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

const map = new Map({ controls: [] })
useViewBasedOnProjection(map)

provide('olMap', map)
provide('getMap', () => map)

if (IS_TESTING_WITH_CYPRESS) {
    window.map = map
}

map.once('rendercomplete', () => {
    // This is needed for cypress in order to start the tests only
    // when openlayer is rendered otherwise some tests will fail.
    store.dispatch('mapModuleReady', dispatcher)
    log.info('Openlayer map rendered')
})

onMounted(() => {
    map.setTarget(mapElement.value)
    useMapInteractions(map)
    usePrintAreaRenderer(map)
    log.info('OpenLayersMap component mounted and ready')
})

const { zIndexTileInfo, zIndexLayerExtents } = useLayerZIndexCalculation()
useOnMapResize(mapElement)
</script>

<template>
    <div class="ol-map position-relative d-flex flex-column">
        <div class="header position-relative pe-auto">
            <slot name="header" />
        </div>
        <div
            class="menu position-absolute top-0 start-0 w-100 h-100"
            :class="{ 'phone-mode': isPhoneMode }"
        >
            <slot name="menu" />
        </div>
        <div
            ref="mapElement"
            class="ol-map-container flex-grow-1 position-relative w-100 h-100"
            data-cy="ol-map"
            @contextmenu.prevent
        >
            <OpenLayersBackgroundLayer />
            <OpenLayersVisibleLayers />
            <OpenLayersPinnedLocation />
            <OpenLayersCrossHair />
            <OpenLayersHighlightedFeature />
            <OpenLayersGeolocationFeedback />
            <OpenLayersRectangleSelectionFeedback />
            <!-- Debug tooling -->
            <OpenLayersTileDebugInfo v-if="showTileDebugInfo" :z-index="zIndexTileInfo" />
            <OpenLayersLayerExtents v-if="showLayerExtents" :z-index="zIndexLayerExtents" />
            <div
                class="toolbox position-absolute bottom-0 start-0 ms-1 mb-1 d-flex flex-column gap-1"
            >
                <slot name="bottom-left" />
                <OpenLayersScale v-if="showScaleLine" />
            </div>
            <div
                class="toolbox position-absolute bottom-0 end-0 d-flex flex-column align-items-end gap-1"
            >
                <div class="me-1">
                    <slot name="bottom-right" />
                </div>
                <MapFooterAttributionList />
            </div>
            <div class="toolbox position-absolute top-0 end-0 pe-none">
                <slot name="toolbox" />
            </div>
        </div>
        <slot />
        <slot name="footer" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import '@/modules/map/scss/menu';

.ol-map {
    z-index: $zindex-map;
}

$dragbox-width: 3px;
// Show selected area when shift click + drag on map
:global(.ol-dragzoom) {
    border: $dragbox-width solid $malibu;
}
// Show selected area when ctrl click + drag on map
:global(.ol-dragbox) {
    border: $dragbox-width solid $red;
}
</style>
