<script setup>
import Map from 'ol/Map'
import { get as getProjection } from 'ol/proj'
import { computed, onMounted, provide, ref } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersLayerExtents from '@/modules/map/components/openlayers/debug/OpenLayersLayerExtents.vue'
import OpenLayersTileDebugInfo from '@/modules/map/components/openlayers/debug/OpenLayersTileDebugInfo.vue'
import OpenLayersBackgroundLayer from '@/modules/map/components/openlayers/OpenLayersBackgroundLayer.vue'
import OpenLayersCrossHair from '@/modules/map/components/openlayers/OpenLayersCrossHair.vue'
import OpenLayersGeolocationFeedback from '@/modules/map/components/openlayers/OpenLayersGeolocationFeedback.vue'
import OpenLayersHighlightedFeature from '@/modules/map/components/openlayers/OpenLayersHighlightedFeatures.vue'
import OpenLayersPinnedLocation from '@/modules/map/components/openlayers/OpenLayersPinnedLocation.vue'
import OpenLayersRectangleSelectionFeedback from '@/modules/map/components/openlayers/OpenLayersRectangleSelectionFeedback.vue'
import OpenLayersVisibleLayers from '@/modules/map/components/openlayers/OpenLayersVisibleLayers.vue'
import useMapInteractions from '@/modules/map/components/openlayers/utils/useMapInteractions.composable'
import usePrintAreaRenderer from '@/modules/map/components/openlayers/utils/usePrintAreaRenderer.composable'
import useViewBasedOnProjection from '@/modules/map/components/openlayers/utils/useViewBasedOnProjection.composable'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'OpenLayersMap.vue' }

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
</script>

<template>
    <div ref="mapElement" class="ol-map" data-cy="ol-map" @contextmenu.prevent>
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
    </div>
    <!-- So that external modules can have access to the map instance through the provided 'olMap' -->
    <slot />
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.ol-map {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute; // Element must be positioned to set a z-index
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
