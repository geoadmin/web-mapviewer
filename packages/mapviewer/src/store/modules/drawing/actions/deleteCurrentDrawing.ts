import { filesAPI } from '@swissgeo/api'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT } from '@/config'
import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useLayersStore from '@/store/modules/layers'

export default function deleteCurrentDrawing(this: DrawingStore, dispatcher: ActionDispatcher) {
    const layersStore = useLayersStore()

    if (!layersStore.activeKmlLayer && !this.layer.temporaryKmlId) {
        return
    }
    this.clearDrawingFeatures(dispatcher)
    this.setDrawingSaveState('INITIAL', dispatcher)
    this.setDrawingMode(undefined, dispatcher)
    this.setIsDrawingEditShared(false, dispatcher)

    if (this.online && layersStore.activeKmlLayer?.id) {
        layersStore.removeLayer(layersStore.activeKmlLayer.id, dispatcher)

        if (layersStore.activeKmlLayer.adminId) {
            filesAPI
                .deleteKml(
                    layersStore.activeKmlLayer.fileId,
                    layersStore.activeKmlLayer.adminId,
                    ENVIRONMENT
                )
                .catch((error) => {
                    log.error({
                        title: 'Drawing store / deleteCurrentDrawing',
                        titleColor: LogPreDefinedColor.Lime,
                        messages: ['Error while deleting feature', error],
                    })
                })
        } else {
            debounceSaveDrawing({ debounceTime: 0 }).catch((error) => {
                log.error({
                    title: 'Drawing store / deleteCurrentDrawing',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Error while creating an empty copy of a KML', error],
                })
            })
        }
    } else if (this.layer.temporaryKmlId) {
        layersStore.removeSystemLayer(`KML|${this.layer.temporaryKmlId}`, dispatcher)
    }

    this.layer.ol?.getSource()?.clear()
    this.edit.featureType = undefined
}
