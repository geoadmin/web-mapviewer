<script setup>
/**
 * Renders all selected features as geometry on the map with a highlighted style and opens up the
 * popup with the features' information
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import explode from '@turf/explode'
import { point } from '@turf/helpers'
import nearestPoint from '@turf/nearest-point'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import proj4 from 'proj4'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import { MapPopoverMode } from '@/modules/map/components/MapPopover.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useVectorLayer from '@/modules/map/components/openlayers/utils/useVectorLayer.composable'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { transformIntoTurfEquivalent } from '@/utils/geoJsonUtils'
import { randomIntBetween } from '@/utils/numberUtils'

const dispatcher = { dispatcher: 'OpenLayersHighlightedFeatures.vue' }

const { t } = useI18n()

// mapping relevant store values
const store = useStore()
const selectedFeatures = computed(() => store.getters.selectedFeatures)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedLayerFeatures = computed(() => store.getters.selectedLayerFeatures)
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const projection = computed(() => store.state.position.projection)
const highlightedFeatureId = computed(() => store.state.features.highlightedFeatureId)
const tooltipFeatureInfo = computed(() => store.getters.showFeatureInfoInTooltip)

const featureTransformedAsOlFeatures = computed(() => {
    // While drawing module is active, we do not want any other feature as the editable one highlighted.
    // And as the drawing module already takes care of applying a specific style to selected editable features,
    // we do nothing if this module is active (returning an empty array instead of feature's geometries)
    if (isCurrentlyDrawing.value) {
        return []
    }
    return selectedLayerFeatures.value.map((feature) => {
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
    if (isCurrentlyDrawing.value && selectedEditableFeatures.value.length > 0) {
        const [topEditableFeature] = selectedEditableFeatures.value
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
    store.dispatch('clearClick', dispatcher)
}
function setBottomPanelFeatureInfoPosition() {
    store.dispatch('setFeatureInfoPosition', {
        position: FeatureInfoPositions.BOTTOMPANEL,
        ...dispatcher,
    })
}
</script>

<template>
    <OpenLayersPopover
        v-if="tooltipFeatureInfo && selectedFeatures.length > 0"
        :coordinates="popoverCoordinate"
        :title="isCurrentlyDrawing ? t('draw_modify_description') : t('object_information')"
        authorize-print
        :use-content-padding="selectedEditableFeatures.length > 0"
        :mode="MapPopoverMode.FLOATING"
        @close="clearAllSelectedFeatures"
    >
        <template #extra-buttons>
            <button
                class="btn btn-sm btn-light d-flex align-items-center"
                data-cy="toggle-floating-off"
                @click="setBottomPanelFeatureInfoPosition"
            >
                <FontAwesomeIcon icon="angles-down" />
            </button>
        </template>
        <FeatureEdit
            v-for="feature in selectedEditableFeatures"
            :key="feature.id"
            :read-only="!isCurrentlyDrawing"
            :feature="feature"
        />
        <FeatureList fluid />
    </OpenLayersPopover>
</template>
