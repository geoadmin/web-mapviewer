<script setup>
/**
 * Renders all selected features as geometry on the map with a highlighted style and opens up the
 * popup with the features' information
 */

import explode from '@turf/explode'
import { point } from '@turf/helpers'
import nearestPoint from '@turf/nearest-point'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import proj4 from 'proj4'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'

import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import useVectorLayer from '@/modules/map/components/openlayers/utils/add-vector-layer-to-map.composable'
import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { transformIntoTurfEquivalent } from '@/utils/geoJsonUtils'
import { randomIntBetween } from '@/utils/numberUtils'

// mapping relevant store values
const store = useStore()
const selectedFeatures = computed(() => store.state.features.selectedFeatures)
const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
const isFloatingTooltip = computed(() => store.state.ui.floatingTooltip)
const projection = computed(() => store.state.position.projection)

const editableFeatures = computed(() =>
    selectedFeatures.value.filter((feature) => feature.isEditable)
)
const nonEditableFeature = computed(() =>
    selectedFeatures.value.filter((feature) => !feature.isEditable)
)
const featureTransformedAsOlFeatures = computed(() =>
    selectedFeatures.value.map((feature) => {
        return new Feature({
            id: `geom-${randomIntBetween(0, 100000)}`,
            geometry: new GeoJSON().readGeometry(feature.geometry),
        })
    })
)
const southPole = point([0.0, -90.0])
const popoverCoordinate = computed(() => {
    const mostSouthernFeature = selectedFeatures.value
        .map((feature) => feature.geometry)
        .map((geometry) => transformIntoTurfEquivalent(geometry, projection.value))
        .map((turfGeom) => explode(turfGeom))
        .map((points) => nearestPoint(southPole, points))
        .reduce((previousPoint, currentPoint) => {
            if (
                !previousPoint ||
                previousPoint.geometry.coordinates[1] > currentPoint.geometry.coordinates[1]
            ) {
                return currentPoint
            }
            return previousPoint
        }, null)
    if (!mostSouthernFeature) {
        return null
    }
    return proj4(WGS84.epsg, projection.value.epsg, mostSouthernFeature.geometry.coordinates).map(
        projection.value.roundCoordinateValue
    )
})

const olMap = inject('olMap')
const { zIndexHighlightedFeatures } = useLayerZIndexCalculation()
useVectorLayer(
    olMap,
    featureTransformedAsOlFeatures,
    zIndexHighlightedFeatures,
    highlightFeatureStyle
)

function clearAllSelectedFeatures() {
    store.dispatch('clearAllSelectedFeatures')
}
function toggleFloatingTooltip() {
    store.dispatch('toggleFloatingTooltip')
}
</script>

<template>
    <OpenLayersPopover
        v-if="isFloatingTooltip && selectedFeatures.length > 0"
        :coordinates="popoverCoordinate"
        authorize-print
        :use-content-padding="editableFeatures.length > 0"
        @close="clearAllSelectedFeatures"
    >
        <template #extra-buttons>
            <button
                class="btn btn-sm btn-light d-flex align-items-center"
                data-cy="toggle-floating-off"
                @click="toggleFloatingTooltip"
            >
                <FontAwesomeIcon icon="caret-down" />
            </button>
        </template>
        <FeatureEdit
            v-for="feature in editableFeatures"
            :key="feature.id"
            :read-only="!isCurrentlyDrawing"
            :feature="feature"
        />
        <FeatureList :features="nonEditableFeature" direction="column" />
    </OpenLayersPopover>
</template>
