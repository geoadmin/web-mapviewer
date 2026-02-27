import type { EditableFeatureTypes } from '@swissgeo/api'
import type Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import { drawLineStyle, useDrawingModeInteraction, useDrawingStore } from '#imports'

interface UseDrawingLineInteractionConfig {
    styleFunction?: StyleFunction
    featureType?: EditableFeatureTypes
    drawEndCallback?: (feature: Feature<SimpleGeometry>) => void
}

export default function useDrawingLineInteraction(config: UseDrawingLineInteractionConfig) {
    const { styleFunction = drawLineStyle, featureType = 'LINEPOLYGON', drawEndCallback } = config

    const drawingStore = useDrawingStore()

    const { removeLastPoint } = useDrawingModeInteraction({
        geometryType: 'LineString',
        editingStyle: styleFunction as StyleFunction,
        editableFeatureArgs: {
            featureType,
            fillColor: drawingStore.edit.preferred.color,
        },
        snapping: true,
        drawEndCallback,
    })

    return {
        removeLastPoint,
    }
}
