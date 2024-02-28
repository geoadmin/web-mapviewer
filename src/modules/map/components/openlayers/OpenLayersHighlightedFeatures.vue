<script setup>
/**
 * Renders all selected features as geometry on the map with a highlighted style and opens up the
 * popup with the features' information
 */

import explode from '@turf/explode'
import { point } from '@turf/helpers'
import nearestPoint from '@turf/nearest-point'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import proj4 from 'proj4'
import { computed, inject, watch } from 'vue'
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

const dispatcher = { dispatcher: 'OpenLayersHighlightedFeatures.vue' }

// mapping relevant store values
const store = useStore()
const selectedFeatures = computed(() => store.state.features.selectedFeatures)
const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
const isFloatingTooltip = computed(() => store.state.ui.floatingTooltip)
const projection = computed(() => store.state.position.projection)
const highlightedFeatureId = computed(() => store.state.features.highlightedFeatureId)

const editableFeatures = computed(() =>
    selectedFeatures.value.filter((feature) => feature.isEditable)
)
const nonEditableFeature = computed(() =>
    selectedFeatures.value.filter((feature) => !feature.isEditable)
)
const featureTransformedAsOlFeatures = computed(() => {
    // While drawing module is active, we do not want any other feature as the editable one highlighted.
    // And as the drawing module already takes care of applying a specific style to selected editable features,
    // we do nothing if this module is active (returning an empty array instead of feature's geometries)
    if (isCurrentlyDrawing.value) {
        return []
    }
    return nonEditableFeature.value.map((feature) => {
        return new Feature({
            id: `geom-${randomIntBetween(0, 100000)}`,
            geometry: new GeoJSON().readGeometry(feature.geometry),
            // flag that will be processed by the style function to change the color when the feature is hovered
            isHovered: highlightedFeatureId.value === feature.id,
        })
    })
})
const southPole = point([0.0, -90.0])
const popoverCoordinate = computed(() => {
    // if we are dealing with any editable feature while drawing, we return its last coordinate
    if (isCurrentlyDrawing.value && editableFeatures.value.length > 0) {
        const [topEditableFeature] = editableFeatures.value
        return topEditableFeature.lastCoordinate
    }
    // If no editable feature is selected while drawing, we place the popover depending on the geometry of all
    // selected features. We will find the most southern coordinate present in all features and use it as anchor.
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

// When new features are selected, if some of them have a complex geometry (polygon or line) we switch to
// the "infobox" (non-floating) tooltip by default.
// This should avoid the popup window to be out of screen if one of the selected features spreads too much south.
watch(nonEditableFeature, () => {
    const containsOnlyPoints =
        nonEditableFeature.value.filter((feature) =>
            ['Point', 'MultiPoint'].includes(feature.geometry?.type)
        ).length === nonEditableFeature.value.length
    if (isFloatingTooltip.value && !containsOnlyPoints) {
        toggleFloatingTooltip()
    }
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
    store.dispatch('clearAllSelectedFeatures', dispatcher)
}
function toggleFloatingTooltip() {
    store.dispatch('toggleFloatingTooltip', dispatcher)
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
