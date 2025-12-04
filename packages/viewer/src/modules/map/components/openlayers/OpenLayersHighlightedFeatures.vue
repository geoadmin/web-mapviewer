<script setup lang="ts">
/**
 * Renders all selected features as geometry on the map with a highlighted style and opens up the
 * popup with the features' information
 */

import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Map } from 'ol'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { randomIntBetween } from '@swissgeo/numbers'
import { explode, nearestPoint, point } from '@turf/turf'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString } from 'ol/geom'
import proj4 from 'proj4'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useVectorLayer from '@/modules/map/components/openlayers/utils/useVectorLayer.composable.ts'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import useProfileStore from '@/store/modules/profile'
import useUiStore from '@/store/modules/ui'
import { transformIntoTurfEquivalent } from '@/utils/geoJsonUtils'

const dispatcher: ActionDispatcher = {
    name: 'OpenLayersHighlightedFeatures.vue',
}

const { t } = useI18n()

// mapping relevant store values
const featuresStore = useFeaturesStore()
const drawingStore = useDrawingStore()
const positionStore = usePositionStore()
const profileStore = useProfileStore()
const uiStore = useUiStore()
const mapStore = useMapStore()

const selectedFeatures = computed(() => featuresStore.selectedFeatures)
const selectedEditableFeatures = computed(() => featuresStore.selectedEditableFeatures)
const selectedLayerFeatures = computed(() => featuresStore.selectedLayerFeatures)
const isCurrentlyDrawing = computed(() => drawingStore.overlay.show)
const projection = computed(() => positionStore.projection)
const highlightedFeatureId = computed(() => featuresStore.highlightedFeatureId)
const tooltipFeatureInfo = computed(() => uiStore.showFeatureInfoInTooltip)
const profileFeature = computed(() => profileStore.feature)
const currentGeometryElements = computed(() => {
    const geometry = profileFeature.value?.geometry
    return geometry && 'coordinates' in geometry ? geometry.coordinates : undefined
})
const currentFeatureSegmentIndex = computed(() => profileStore.currentFeatureGeometryIndex)
const isMultiFeature = computed(() => profileStore.isProfileFeatureMultiFeature)

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

const segmentTransformedAsOlFeatures = computed((): Feature[] => {
    if (
        !profileFeature.value ||
        !isMultiFeature.value ||
        !currentGeometryElements.value ||
        !Array.isArray(currentGeometryElements.value)
    ) {
        return []
    }

    return (currentGeometryElements.value as number[][][]).reduce(
        (features: Feature[], geometry: number[][], index: number) => {
            if (currentFeatureSegmentIndex.value === index) {
                features.push(
                    new Feature({
                        id: `geom-segment-${randomIntBetween(0, 100000)}`,
                        geometry: new LineString(geometry),
                        // flag that will be processed by the style function to change the color when the segment is selected
                        isCurrentSegment: currentFeatureSegmentIndex.value === index,
                    })
                )
            }
            return features
        },
        []
    )
})

const southPole = point([0.0, -90.0])
const popoverCoordinate = computed((): SingleCoordinate | undefined => {
    // if we are dealing with any editable feature while drawing, we return its last coordinate
    if (isCurrentlyDrawing.value && selectedEditableFeatures.value.length > 0) {
        const [topEditableFeature] = selectedEditableFeatures.value
        if (
            topEditableFeature &&
            topEditableFeature.coordinates &&
            topEditableFeature.coordinates.length > 0
        ) {
            const lastCoordinate =
                topEditableFeature.coordinates[topEditableFeature.coordinates.length - 1]
            return Array.isArray(lastCoordinate) && lastCoordinate.length === 2
                ? (lastCoordinate as SingleCoordinate)
                : undefined
        }
    }
    // If no editable feature is selected while drawing, we place the popover depending on the geometry of all
    // selected features. We will find the most southern coordinate present in all features and use it as anchor.
    const mostSouthernFeature = selectedFeatures.value
        .filter((feature) => feature.geometry !== undefined)
        .map((feature) => feature.geometry!)
        .map((geometry) => transformIntoTurfEquivalent(geometry, projection.value))
        .filter((turfGeom) => turfGeom !== undefined)
        .map((turfGeom) => explode(turfGeom))
        .map((points) => nearestPoint(southPole, points))
        .reduce<typeof southPole | undefined>((previousPoint, currentPoint) => {
            if (!previousPoint) {
                return currentPoint
            }
            const prevCoords = previousPoint.geometry?.coordinates
            const currCoords = currentPoint.geometry?.coordinates
            if (
                prevCoords &&
                currCoords &&
                Array.isArray(prevCoords) &&
                Array.isArray(currCoords) &&
                prevCoords.length > 1 &&
                currCoords.length > 1 &&
                typeof prevCoords[1] === 'number' &&
                typeof currCoords[1] === 'number' &&
                prevCoords[1] > currCoords[1]
            ) {
                return currentPoint
            }
            return previousPoint
        }, undefined)
    if (!mostSouthernFeature) {
        return undefined
    }
    return proj4(WGS84.epsg, projection.value.epsg, mostSouthernFeature.geometry.coordinates).map(
        projection.value.roundCoordinateValue
    ) as SingleCoordinate
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

const { zIndexHighlightedFeatures } = useLayerZIndexCalculation()

useVectorLayer(
    olMap,
    featureTransformedAsOlFeatures,
    zIndexHighlightedFeatures,
    highlightFeatureStyle
)
useVectorLayer(
    olMap,
    segmentTransformedAsOlFeatures,
    zIndexHighlightedFeatures,
    highlightFeatureStyle
)

function clearAllSelectedFeatures(): void {
    featuresStore.clearAllSelectedFeatures(dispatcher)
    mapStore.clearClick(dispatcher)
}
function setBottomPanelFeatureInfoPosition(): void {
    uiStore.setFeatureInfoPosition('bottompanel', dispatcher)
}
</script>

<template>
    <OpenLayersPopover
        v-if="tooltipFeatureInfo && selectedFeatures.length > 0"
        :coordinates="popoverCoordinate"
        :title="isCurrentlyDrawing ? t('draw_modify_description') : t('object_information')"
        authorize-print
        :use-content-padding="selectedEditableFeatures.length > 0"
        :mode="'FLOATING'"
        @close="clearAllSelectedFeatures"
    >
        <template #extra-buttons>
            <button
                class="btn btn-sm btn-light d-flex align-items-center"
                data-cy="toggle-floating-off"
                @click="setBottomPanelFeatureInfoPosition"
                @mousedown.stop=""
            >
                <FontAwesomeIcon icon="angles-down" />
            </button>
        </template>
        <FeatureStyleEdit
            v-for="feature in selectedEditableFeatures"
            :key="feature.id"
            :read-only="!isCurrentlyDrawing"
            :feature="feature"
        />
        <FeatureList />
    </OpenLayersPopover>
</template>
