import type { EditableFeature } from '@swissgeo/api'
import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import log from '@swissgeo/log'
import { debounceSaveDrawing, logConfig } from '#imports'

export default function setCurrentlyDrawnFeature(
    this: DrawingStore,
    feature: EditableFeature | undefined,
    dispatcher: ActionDispatcher
) {
    this.feature.current = feature

    if (this.feature.current) {
        this.edit.mode = 'MODIFY'
        if (
            !this.feature.all.some(
                (feature: EditableFeature) => feature.id === this.feature.current?.id
            )
        ) {
            this.feature.all.push(this.feature.current)
            if (this.online) {
                this.save.state = 'UNSAVED_CHANGES'
                debounceSaveDrawing()
                    .then(() => {
                        this.save.state = 'SAVED'
                    })
                    .catch((error) => {
                        this.save.state = 'SAVE_ERROR'
                        log.error({
                            ...logConfig('store - setCurrentlyDrawnFeature'),
                            messages: ['Error while saving new feature', error],
                        })
                    })
            }
        }
    } else {
        this.edit.mode = 'OFF'
    }
}
