<script setup lang="ts">
import type Map from 'ol/Map'

// Extend Window interface for Cypress testing
declare global {
    interface Window {
        map?: Map
    }
}

import { allCoordinateSystems, WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import OlMap from 'ol/Map'
import { get as getProjection } from 'ol/proj'
import { computed, onMounted, provide, useTemplateRef } from 'vue'

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
import useMapInteractions from '@/modules/map/components/openlayers/utils/useMapInteractions.composable.ts'
import usePrintAreaRenderer from '@/modules/map/components/openlayers/utils/usePrintAreaRenderer.composable.ts'
import useViewBasedOnProjection from '@/modules/map/components/openlayers/utils/useViewBasedOnProjection.composable.ts'
import useAppStore from '@/store/modules/app.store'
import useDebugStore from '@/store/modules/debug.store'
import useGeolocationStore from '@/store/modules/geolocation.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'

const dispatcher = { name: 'OpenLayersMap.vue' }

// setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
// this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
allCoordinateSystems
    .filter((projection) => projection.bounds && projection.epsg !== WGS84.epsg)
    .forEach((projection) => {
        const olProjection = getProjection(projection.epsg)
        if (projection.bounds) {
            olProjection?.setExtent(projection.bounds.flatten)
        }
    })

const mapElement = useTemplateRef<HTMLElement>('mapElement')

const debugStore = useDebugStore()
const mapStore = useMapStore()
const geolocationStore = useGeolocationStore()
const layersStore = useLayersStore()
const appStore = useAppStore()

const showTileDebugInfo = computed(() => debugStore.showTileDebugInfo)
const showLayerExtents = computed(() => debugStore.showLayerExtents)
const showSelectionRectangle = computed(() => !!mapStore.rectangleSelectionExtent)
const geolocationActive = computed(() => geolocationStore.active)
const geoPosition = computed(() => geolocationStore.position)
const visibleLayers = computed(() => layersStore.visibleLayers)

const map: Map = new OlMap({ controls: [] })
useViewBasedOnProjection(map)

provide('olMap', map)

if (IS_TESTING_WITH_CYPRESS) {
    window.map = map
}

function triggerReadyFlagIfAllRendered(): void {
    if (
        map.getAllLayers().length < visibleLayers.value.filter((layer) => !layer.hasError).length ||
        visibleLayers.value.some((layer) => layer.isLoading)
    ) {
        // OL hasn't loaded all our layers yet, postponing the ready event
        map.once('loadend', triggerReadyFlagIfAllRendered)
    } else {
        // This is needed for cypress to start the tests only
        // when OpenLayers is rendered, otherwise some tests will fail.
        appStore.setMapModuleReady(dispatcher)
        log.info('OpenLayers map rendered')
    }
}
map.once('rendercomplete', triggerReadyFlagIfAllRendered)

onMounted(() => {
    if (mapElement.value) {
        map.setTarget(mapElement.value)
    }
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
