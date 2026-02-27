import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import { filesAPI } from '@swissgeo/api'
import log from '@swissgeo/log'
import { logConfig } from '#imports'

export default async function deleteCurrentDrawing(
    this: DrawingStore,
    dispatcher: ActionDispatcher
) {
    if (!this.layer.config && !this.layer.config.adminId) {
        return
    }

    if (this.online) {
        this.save.state = 'UNSAVED_CHANGES'
        try {
            await filesAPI.deleteKml(
                this.layer.config.fileId,
                this.layer.config.adminId,
                this.debug.staging
            )
        } catch (error) {
            log.error({
                ...logConfig('store - deleteDrawingFeature'),
                messages: ['Error while deleting drawing', error],
            })
            throw error
        }
    }

    this.feature.all = []
    this.feature.current = undefined
    this.layer.ol?.getSource()?.clear()

    delete this.layer.config

    this.save.state = 'INITIAL'
    this.edit.featureType = undefined
    this.isDrawingEditShared = false
}
