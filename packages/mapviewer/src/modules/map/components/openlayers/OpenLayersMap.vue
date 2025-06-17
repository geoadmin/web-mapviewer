<script setup>
import { allCoordinateSystems, WGS84 } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import Map from 'ol/Map'
import { get as getProjection } from 'ol/proj'
import { computed, onMounted, provide, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersLayerExtents from '@/modules/map/components/openlayers/debug/OpenLayersLayerExtents.vue'
import OpenLayersTileDebugInfo from '@/modules/map/components/openlayers/debug/OpenLayersTileDebugInfo.vue'
import OpenLayersBackgroundLayer from '@/modules/map/components/openlayers/OpenLayersBackgroundLayer.vue'
import OpenLayersCrossHair from '@/modules/map/components/openlayers/OpenLayersCrossHair.vue'
import OpenLayersGeolocationFeedback from '@/modules/map/components/openlayers/OpenLayersGeolocationFeedback.vue'
import OpenLayersHighlightedFeature from '@/modules/map/components/openlayers/OpenLayersHighlightedFeatures.vue'
import OpenLayersPinnedLocation from '@/modules/map/components/openlayers/OpenLayersPinnedLocation.vue'
import OpenLayersRectangleSelectionFeedback from '@/modules/map/components/openlayers/OpenLayersRectangleSelectionFeedback.vue'
import OpenLayersSelectionRectangle from '@/modules/map/components/openlayers/OpenLayersSelectionRectangle.vue'
import OpenLayersVisibleLayers from '@/modules/map/components/openlayers/OpenLayersVisibleLayers.vue'
import useMapInteractions from '@/modules/map/components/openlayers/utils/useMapInteractions.composable'
import usePrintAreaRenderer from '@/modules/map/components/openlayers/utils/usePrintAreaRenderer.composable'
import useViewBasedOnProjection from '@/modules/map/components/openlayers/utils/useViewBasedOnProjection.composable'

const dispatcher = { dispatcher: 'OpenLayersMap.vue' }

// setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
// this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
allCoordinateSystems
    .filter((projection) => projection.bounds && projection.epsg !== WGS84.epsg)
    .forEach((projection) => {
        const olProjection = getProjection(projection.epsg)
        olProjection?.setExtent(projection.bounds.flatten)
    })

const mapElement = useTemplateRef('mapElement')

const store = useStore()
const showTileDebugInfo = computed(() => store.state.debug.showTileDebugInfo)
const showLayerExtents = computed(() => store.state.debug.showLayerExtents)
const showSelectionRectangle = computed(() => store.state.features.selectionRectangleVisible)
const geolocationActive = computed(() => store.state.geolocation.active)
const geoPosition = computed(() => store.state.geolocation.position)
const visibleLayers = computed(() => store.getters.visibleLayers)

const map = new Map({ controls: [] })
useViewBasedOnProjection(map)

provide('olMap', map)

if (IS_TESTING_WITH_CYPRESS) {
    window.map = map
}

function triggerReadyFlagIfAllRendered() {
    if (
        map.getAllLayers().length < visibleLayers.value.filter((layer) => !layer.hasError).length ||
        visibleLayers.value.some((layer) => layer.isLoading)
    ) {
        // OL hasn't loaded all our layers yet, postponing the ready event
        map.once('loadend', triggerReadyFlagIfAllRendered)
    } else {
        // This is needed for cypress to start the tests only
        // when OpenLayers is rendered, otherwise some tests will fail.
        store.dispatch('mapModuleReady', dispatcher)
        log.info('OpenLayers map rendered')
    }
}
map.once('rendercomplete', triggerReadyFlagIfAllRendered)

onMounted(() => {
    map.setTarget(mapElement.value)
    useMapInteractions(map)
    usePrintAreaRenderer(map)
    log.info('OpenLayersMap component mounted and ready')
})

const { zIndexTileInfo, zIndexLayerExtents, zIndexSelectionRectangle } = useLayerZIndexCalculation()
</script>

<template>
    <div
        ref="mapElement"
        class="ol-map"
        data-cy="ol-map"
        @contextmenu.prevent
    >
        <OpenLayersBackgroundLayer />
        <OpenLayersVisibleLayers />
        <OpenLayersPinnedLocation />
        <OpenLayersCrossHair />
        <OpenLayersHighlightedFeature />
        <OpenLayersGeolocationFeedback v-if="geolocationActive && geoPosition" />
        <OpenLayersRectangleSelectionFeedback />
        <!-- Debug tooling -->
        <OpenLayersTileDebugInfo
            v-if="showTileDebugInfo"
            :z-index="zIndexTileInfo"
        />
        <OpenLayersLayerExtents
            v-if="showLayerExtents"
            :z-index="zIndexLayerExtents"
        />
        <OpenLayersSelectionRectangle
            v-if="showSelectionRectangle"
            :z-index="zIndexSelectionRectangle"
        />

    </div>
    <!-- So that external modules can have access to the map instance through the provided 'olMap' -->
    <slot />
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

$dragbox-width: 3px;

.ol-map {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute; // Element must be positioned to set a z-index
    z-index: $zindex-map;
}
// Show selected area when shift click + drag on map
:global(.ol-dragzoom) {
    border: $dragbox-width solid $malibu;
}
// Show selected area when ctrl click + drag on map
:global(.ol-dragbox) {
    border: $dragbox-width solid $red;
}
</style>
