import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

export default function setDrawingProjection(
    this: DrawingStore,
    projection: CoordinateSystem,
    dispatcher: ActionDispatcher
) {
    this.projection = projection
}
