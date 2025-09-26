import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable.ts'
import { drawLineStyle } from '@/modules/drawing/lib/style'
import type { StyleFunction } from 'ol/style/Style'
import type OLFeature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'

interface UseDrawingLineInteractionConfig {
    styleFunction?: StyleFunction
    featureType?: EditableFeatureTypes
    drawEndCallback?: (feature: OLFeature<SimpleGeometry>) => void
}

export default function useDrawingLineInteraction(config: UseDrawingLineInteractionConfig) {
    const {
        styleFunction = drawLineStyle,
        featureType = EditableFeatureTypes.LinePolygon,
        drawEndCallback,
    } = config
    const { removeLastPoint } = useDrawingModeInteraction({
        geometryType: 'Polygon',
        editingStyle: styleFunction as StyleFunction,
        editableFeatureArgs: {
            featureType,
        },
        useGeodesicDrawing: true,
        snapping: true,
        drawEndCallback,
    })

    return {
        removeLastPoint,
    }
}
