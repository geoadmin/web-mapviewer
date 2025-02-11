<script setup>
/** Renders a marker on the map (different styling are available) */

import { randomIntBetween } from 'geoadmin/numbers'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import { computed, inject, watch } from 'vue'

import {
    getMarkerStyle,
    highlightFeatureStyle,
    OpenLayersMarkerStyles,
} from '@/modules/map/components/openlayers/utils/markerStyle'
import useVectorLayer from '@/modules/map/components/openlayers/utils/useVectorLayer.composable'

const { position, markerStyle, zIndex, selectFeatureCallback, deselectAfterSelect } = defineProps({
    position: {
        type: Array,
        required: true,
    },
    markerStyle: {
        type: String,
        default: OpenLayersMarkerStyles.BALLOON,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
    selectFeatureCallback: {
        type: Function,
        default: () => {},
    },
    deselectAfterSelect: {
        type: Boolean,
        default: false,
    },
})

const features = computed(() => {
    if (!Array.isArray(position)) {
        return []
    }
    if (Array.isArray(position) && position.length === 2 && typeof position[0] === 'number') {
        return [featuresForPosition(position, markerStyle)]
    }
    // we have received multiple point at once, we need to parse them each one at a time
    return position.map((point) => featuresForPosition(point, markerStyle))
})

const olMap = inject('olMap')
useVectorLayer(olMap, features, {
    zIndex: zIndex,
    styleFunction: highlightFeatureStyle,
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
function featuresForPosition(position, style) {
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
