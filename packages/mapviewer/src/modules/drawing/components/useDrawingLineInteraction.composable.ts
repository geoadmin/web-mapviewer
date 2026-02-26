import type { EditableFeatureTypes } from '@swissgeo/api'
import type Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type { StyleFunction } from 'ol/style/Style'

import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'
import useDrawingStore from '@/store/modules/drawing'

interface UseDrawingLineInteractionConfig {
    styleFunction?: StyleFunction
    featureType?: EditableFeatureTypes
    drawEndCallback?: (feature: Feature<SimpleGeometry>) => void
}

export default function useDrawingLineInteraction(config: UseDrawingLineInteractionConfig) {
    const { styleFunction = drawLineStyle, featureType = 'LINEPOLYGON', drawEndCallback } = config

    const drawingStore = useDrawingStore()

    const { removeLastPoint } = useDrawingModeInteraction({
        geometryType: 'Polygon',
        editingStyle: styleFunction,
        editableFeatureArgs: {
            featureType,
            fillColor: drawingStore.edit.preferred.color,
        },
        useGeodesicDrawing: true,
        snapping: true,
        drawEndCallback,
    })

    return {
        removeLastPoint,
    }
}
