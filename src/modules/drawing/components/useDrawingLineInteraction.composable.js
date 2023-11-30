import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

export default function useDrawingLineInteraction({
    style = drawLineStyle,
    featureType = EditableFeatureTypes.LINEPOLYGON,
}) {
    const { removeLastPoint, lastFinishedFeature } = useDrawingModeInteraction({
        geometryType: 'Polygon',
        editingStyle: style,
        editableFeatureArgs: {
            featureType,
        },
        useGeodesicDrawing: true,
        snapping: true,
    })

    return {
        removeLastPoint,
        lastFinishedFeature,
    }
}
