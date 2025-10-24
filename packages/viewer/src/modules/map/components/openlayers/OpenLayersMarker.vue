<script setup lang="ts">
/** Renders a marker on the map (different styling are available) */

import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Map } from 'ol'
import type { MaybeRef } from 'vue'

import log from '@swissgeo/log'
import { randomIntBetween } from '@swissgeo/numbers'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import { computed, inject, watch } from 'vue'

import {
    getMarkerStyle,
    highlightFeatureStyle,
    OpenLayersMarkerStyles,
} from '@/modules/map/components/openlayers/utils/markerStyle'
import useVectorLayer from '@/modules/map/components/openlayers/utils/useVectorLayer.composable'

const {
    position,
    markerStyle = OpenLayersMarkerStyles.Balloon,
    zIndex = -1,
    selectFeatureCallback = () => {},
    deselectAfterSelect = false,
} = defineProps<{
    position: SingleCoordinate | SingleCoordinate[]
    markerStyle?: OpenLayersMarkerStyles
    zIndex?: MaybeRef<number>
    selectFeatureCallback?: (_feature: Feature) => void
    deselectAfterSelect?: boolean
}>()

const features = computed(() => {
    if (!Array.isArray(position)) {
        return []
    }
    if (Array.isArray(position) && position.length === 2 && typeof position[0] === 'number') {
        const feature = featuresForPosition(position as SingleCoordinate, markerStyle)
        return feature ? [feature] : []
    }
    // we have received multiple point at once, we need to parse them each one at a time
    return (position as SingleCoordinate[])
        .map((point) => featuresForPosition(point, markerStyle))
        .filter((f): f is Feature<Point> => f !== undefined)
})

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

useVectorLayer(olMap, features, zIndex, highlightFeatureStyle, {
    onFeatureSelectCallback: selectFeatureCallback,
    deselectAfterSelect: deselectAfterSelect,
})

watch(
    () => markerStyle,
    (newStyle) => {
        const olStyle = getMarkerStyle(newStyle)
        features.value.forEach((feature) => feature.setStyle(olStyle))
    }
)

/**
 * @param position
 * @param style
 * @returns {Feature<Point>}
 */
function featuresForPosition(
    position: SingleCoordinate,
    style: OpenLayersMarkerStyles
): Feature<Point> | undefined {
    if (!Array.isArray(position)) {
        return undefined
    }
    const feature = new Feature({
        id: `marker-${randomIntBetween(0, 100000)}`,
        geometry: new Point(position),
    })
    feature.setStyle(getMarkerStyle(style))
    return feature
}
</script>

<template>
    <slot />
</template>
