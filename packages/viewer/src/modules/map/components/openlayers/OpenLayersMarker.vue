<script setup lang="ts">
/** Renders a marker on the map (different styling are available) */

import type { Map } from 'ol'
import type { StyleLike } from 'ol/style/Style'
import type { SingleCoordinate } from '@swissgeo/coordinates'
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

interface Props {
    position: SingleCoordinate | SingleCoordinate[]
    markerStyle?: OpenLayersMarkerStyles
    zIndex?: number
    selectFeatureCallback?: (_feature: Feature) => void
    deselectAfterSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    markerStyle: OpenLayersMarkerStyles.Balloon,
    zIndex: -1,
    selectFeatureCallback: () => {},
    deselectAfterSelect: false,
})

const features = computed(() => {
    if (!Array.isArray(props.position)) {
        return []
    }
    if (Array.isArray(props.position) && props.position.length === 2 && typeof props.position[0] === 'number') {
        const feature = featuresForPosition(props.position as SingleCoordinate, props.markerStyle)
        return feature ? [feature] : []
    }
    // we have received multiple point at once, we need to parse them each one at a time
    return (props.position as SingleCoordinate[])
        .map((point) => featuresForPosition(point, props.markerStyle))
        .filter((f): f is Feature<Point> => f !== undefined)
})

const olMap = inject<Map>('olMap')!
useVectorLayer(olMap, features, {
    zIndex: props.zIndex,
    styleFunction: highlightFeatureStyle as StyleLike,
    onFeatureSelectCallback: props.selectFeatureCallback,
    deselectAfterSelect: props.deselectAfterSelect,
})

watch(
    () => props.markerStyle,
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
function featuresForPosition(position: SingleCoordinate, style: OpenLayersMarkerStyles): Feature<Point> | undefined {
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
