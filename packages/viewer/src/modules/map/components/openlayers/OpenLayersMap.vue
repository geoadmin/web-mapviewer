<script setup lang="ts">
import { allCoordinateSystems, WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import OlMap from 'ol/Map'
import type { Map as OlMapType } from 'ol'
import { get as getProjection } from 'ol/proj'
import { onMounted, provide, useTemplateRef } from 'vue'

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
import type { ActionDispatcher } from '@/store/types'
import useDebugStore from '@/store/modules/debug.store'
import useMapStore from '@/store/modules/map.store'
import useAppStore from '@/store/modules/app'
import useGeolocationStore from '@/store/modules/geolocation'
import useLayersStore from '@/store/modules/layers.store'

const dispatcher: ActionDispatcher = { name: 'OpenLayersMap.vue' }

// setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
// this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
allCoordinateSystems
    .filter((projection) => projection.bounds && projection.epsg !== WGS84.epsg)
    .forEach((projection) => {
        const olProjection = getProjection(projection.epsg)
        if (olProjection && projection.bounds) {
            olProjection.setExtent(projection.bounds.flatten)
        }
    })

const mapElementRef = useTemplateRef<HTMLDivElement>('mapElement')

const appStore = useAppStore()
const debugStore = useDebugStore()
const geolocationStore = useGeolocationStore()
const layersStore = useLayersStore()
const mapStore = useMapStore()

const map: OlMapType = new OlMap({ controls: [] })
useViewBasedOnProjection(map)

provide<OlMapType>('olMap', map)

if (IS_TESTING_WITH_CYPRESS) {
    window.map = map
}

function triggerReadyFlagIfAllRendered(): void {
    if (
        map.getAllLayers().length <
            layersStore.visibleLayers.filter((layer) => !layer.hasError).length ||
        layersStore.visibleLayers.some((layer) => layer.isLoading)
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
    if (mapElementRef.value) {
        map.setTarget(mapElementRef.value)
        useMapInteractions(map)
        usePrintAreaRenderer(map)
        log.info('OpenLayersMap component mounted and ready')
    } else {
        log.error('OpenLayersMap component mounted but no map element found')
    }
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
        <OpenLayersGeolocationFeedback
            v-if="geolocationStore.active && geolocationStore.position"
        />
        <OpenLayersRectangleSelectionFeedback />
        <!-- Debug tooling -->
        <OpenLayersTileDebugInfo
            v-if="debugStore.showTileDebugInfo"
            :z-index="zIndexTileInfo"
        />
        <OpenLayersLayerExtents
            v-if="debugStore.showLayerExtents"
            :z-index="zIndexLayerExtents"
        />
        <OpenLayersSelectionRectangle
            v-if="mapStore.rectangleSelectionExtent"
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
