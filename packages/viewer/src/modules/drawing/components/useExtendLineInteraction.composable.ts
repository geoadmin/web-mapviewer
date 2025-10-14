import type Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import { toValue, type MaybeRefOrGetter } from 'vue'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

export interface UseExtendLineInteractionOptions {
    style?: StyleFunction
    featureType?: EditableFeatureTypes
    drawEndCallback?: ((feature: Feature<SimpleGeometry>) => void)
    startingFeature?: MaybeRefOrGetter<Feature<SimpleGeometry> | undefined>
}

export interface UseExtendLineInteractionResult {
    removeLastPoint: () => void
}

export default function useExtendLineInteraction({
    style = drawLineStyle as StyleFunction,
    featureType = EditableFeatureTypes.LinePolygon,
    drawEndCallback = undefined,
    startingFeature = undefined,
}: UseExtendLineInteractionOptions = {}): UseExtendLineInteractionResult {
    const { removeLastPoint } = useDrawingModeInteraction({
        geometryType: 'Polygon',
        editingStyle: style,
        editableFeatureArgs: { featureType },
        useGeodesicDrawing: true,
        snapping: true,
        drawEndCallback,
        startingFeature: toValue(startingFeature),
    })
    return { removeLastPoint }
}
