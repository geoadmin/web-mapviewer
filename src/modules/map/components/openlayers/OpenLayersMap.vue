<script setup>
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import OpenLayersBackgroundLayer from '@/modules/map/components/openlayers/OpenLayersBackgroundLayer.vue'
import OpenLayersCrossHair from '@/modules/map/components/openlayers/OpenLayersCrossHair.vue'
import OpenLayersGeolocationFeedback from '@/modules/map/components/openlayers/OpenLayersGeolocationFeedback.vue'
import OpenLayersHighlightedFeature from '@/modules/map/components/openlayers/OpenLayersHighlightedFeatures.vue'
import OpenLayersPinnedLocation from '@/modules/map/components/openlayers/OpenLayersPinnedLocation.vue'
import OpenLayersVisibleLayers from '@/modules/map/components/openlayers/OpenLayersVisibleLayers.vue'
import useMapInteractions from '@/modules/map/components/openlayers/utils/map-interactions.composable'
import useViewBasedOnProjection from '@/modules/map/components/openlayers/utils/map-views.composable'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import Map from 'ol/Map'
import { get as getProjection } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { onMounted, provide, ref } from 'vue'

// register any custom projection in OpenLayers
register(proj4)

// setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
// this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
allCoordinateSystems
    .filter((projection) => projection.bounds && projection.epsg !== WGS84.epsg)
    .forEach((projection) => {
        const olProjection = getProjection(projection.epsg)
        olProjection?.setExtent(projection.bounds.flatten)
    })

const mapElement = ref(null)

const map = new Map({ controls: [] })
useMapInteractions(map)
useViewBasedOnProjection(map)

provide('olMap', map)
provide('getMap', () => map)

if (IS_TESTING_WITH_CYPRESS) {
    window.map = map
}

onMounted(() => {
    map.setTarget(mapElement.value)
})
</script>

<template>
    <div ref="mapElement" class="ol-map" data-cy="ol-map" @contextmenu.prevent>
        <OpenLayersBackgroundLayer />
        <OpenLayersVisibleLayers />
        <OpenLayersPinnedLocation />
        <OpenLayersCrossHair />
        <OpenLayersHighlightedFeature />
        <OpenLayersGeolocationFeedback />
    </div>
    <!-- So that external modules can have access to the map instance through the provided 'olMap' -->
    <slot />
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.ol-map {
    width: 100%;
    height: 100%;
    position: relative; // Element must be positioned to set a z-index
    z-index: $zindex-map;
}
</style>
