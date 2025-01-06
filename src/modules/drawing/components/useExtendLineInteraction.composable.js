import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import { drawLineStyle } from '@/modules/drawing/lib/style'

/**
 * Custom hook to extend line interaction with drawing mode.
 *
 * @param {Object} options - Options for the extend line interaction.
 * @param {Object} [options.style=drawLineStyle] - The style to be applied to the line. Default is
 *   `drawLineStyle`
 * @param {string} [options.featureType=EditableFeatureTypes.LINEPOLYGON] - The type of feature to
 *   be edited. Default is `EditableFeatureTypes.LINEPOLYGON`
 * @param {Function} [options.drawEndCallback=null] - Callback function to be called when drawing
 *   ends. Default is `null`
 * @param {Object} [options.startingFeature=null] - The starting feature for the drawing. Default is
 *   `null`
 * @returns {Object} - An object containing the removeLastPoint function.
 */
export default function useExtendLineInteraction({
    style = drawLineStyle,
    featureType = EditableFeatureTypes.LINEPOLYGON,
    drawEndCallback = null,
    startingFeature = null,
}) {
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
