import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import { isOnlineMode } from '@/store/modules/drawing/utils/isOnlineMode'
import useLayersStore from '@/store/modules/layers'

export default function deleteCurrentDrawing(this: DrawingStore, dispatcher: ActionDispatcher) {
    if (!this.layer.config && !this.layer.temporaryKmlId) {
        return
    }
    this.clearDrawingFeatures(dispatcher)
    this.setDrawingSaveState('INITIAL', dispatcher)
    this.setDrawingMode(undefined, dispatcher)
    this.setIsDrawingEditShared(false, dispatcher)

    const layersStore = useLayersStore()

    if (isOnlineMode(this.onlineMode) && this.layer.config?.id) {
        layersStore.removeLayer(this.layer.config.id, dispatcher)
    } else if (this.layer.temporaryKmlId) {
        layersStore.removeSystemLayer(`KML|${this.layer.temporaryKmlId}`, dispatcher)
    }

    this.layer.ol?.getSource()?.clear()
    this.edit.featureType = undefined
}
