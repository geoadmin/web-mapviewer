import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { DrawingSaveState } from '@/store/modules/drawing/types/DrawingSaveState.enum'
import useLayersStore from '@/store/modules/layers'

export default function deleteCurrentDrawing(
    this: DrawingStore,
    dispatcher: ActionDispatcher
) {
    this.clearDrawingFeatures(dispatcher)
    this.setDrawingSaveState(DrawingSaveState.Initial, dispatcher)
    this.setDrawingMode(undefined, dispatcher)
    this.setIsDrawingEditShared(false, dispatcher)
    if (this.layer) {
        const layersStore = useLayersStore()
        layersStore.removeSystemLayer(`KML|${this.layer.temporaryKmlId}`, dispatcher)
        this.clearDrawingFeatures(dispatcher)
    }
    this.edit.featureType = undefined
    this.layer.ol?.getSource()?.clear()
}
