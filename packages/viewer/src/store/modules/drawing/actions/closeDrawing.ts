import type { KMLLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

const LOADING_BAR_REQUESTER = 'closing-drawing'

export default async function closeDrawing(this: DrawingStore, dispatcher: ActionDispatcher) {
    log.debug({
        title: 'Drawing store / closeDrawing',
        titleColor: LogPreDefinedColor.Lime,
        messages: [
            `Closing drawing menu: isModified=${this.isDrawingModified}, isNew=${this.isDrawingNew}, isEmpty=${this.isDrawingEmpty}`,
        ],
    })

    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    uiStore.setLoadingBarRequester(LOADING_BAR_REQUESTER, dispatcher)

    try {
        featuresStore.clearAllSelectedFeatures(dispatcher)

        // Clear any pending save not started, then wait for in-progress saves
        if (this.save.pending) {
            clearTimeout(this.save.pending)
        }

        // Save on close when modified and (not new or not empty)
        if (this.isDrawingModified && (!this.isDrawingNew || !this.isDrawingEmpty)) {
            await debounceSaveDrawing({ debounceTime: 0, retryOnError: false })
        }

        this.toggleDrawingOverlay(
            {
                show: false,
            },
            dispatcher
        )

        if (this.layer.config) {
            // flagging the layer as not edited anymore (not displayed on the map by the drawing module anymore)
            layersStore.updateLayer<KMLLayer>(
                this.layer.config,
                {
                    isEdited: false,
                },
                dispatcher
            )
            delete this.layer.config
        }

        this.edit.featureType = undefined
        this.layer.ol?.getSource()?.clear()

        if (IS_TESTING_WITH_CYPRESS) {
            delete window.drawingLayer
        }
        this.layer.ol?.dispose()
        delete this.layer.ol
    } catch (error) {
        log.error({
            title: 'Drawing store / closeDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Error while closing drawing', error],
        })
    } finally {
        uiStore.clearLoadingBarRequester(LOADING_BAR_REQUESTER, dispatcher)
    }
}
