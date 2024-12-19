import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'
export default function useContinueLineInteraction({
    style = drawLineStyle,
    featureType = EditableFeatureTypes.LINEPOLYGON,
    drawEndCallback = null,
    startingFeature = null,
}) {
    console.log('[useContinueLineInteraction] startingFeature:', startingFeature)
    const { removeLastPoint } = useDrawingModeInteraction({
        geometryType: 'Polygon',
        editingStyle: style,
        editableFeatureArgs: {
            featureType,
        },
        useGeodesicDrawing: true,
        snapping: true,
        drawEndCallback,
        startingFeature,
    })
    return {
        removeLastPoint,
    }
}
