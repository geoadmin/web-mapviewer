import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { EditableFeature } from '@/api/features.api'
import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { DrawingSaveState } from '@/store/modules/drawing/types/DrawingSaveState.enum'
import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useProfileStore from '@/store/modules/profile'

export default function updateCurrentDrawingFeature(
    this: DrawingStore,
    valuesToUpdate: Partial<EditableFeature>,
    dispatcher: ActionDispatcher
) {
    if (this.feature.current) {
        this.save.state = DrawingSaveState.UnsavedChanges

        Object.assign(this.feature.current, valuesToUpdate)

        // keeping values as preferred, if present, so that the next time the user draws, the values are used
        if (valuesToUpdate.iconSize) {
            this.edit.preferred.iconSize = valuesToUpdate.iconSize
        }
        if (valuesToUpdate.fillColor) {
            this.edit.preferred.iconColor = valuesToUpdate.fillColor
        }
        if (valuesToUpdate.textPlacement) {
            this.edit.preferred.textPlacement = valuesToUpdate.textPlacement
        }

        const profileStore = useProfileStore()
        // updating the profile feature if the currently drawn feature is the profile feature
        if (profileStore.feature?.id === this.feature.current.id) {
            profileStore.setProfileFeature(this.feature.current, dispatcher)
        }

        debounceSaveDrawing()
            .then(() => {
                this.save.state = DrawingSaveState.Saved
            })
            .catch((error) => {
                this.save.state = DrawingSaveState.SaveError
                log.error({
                    title: 'Drawing store / updateCurrentDrawingFeature',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Error while saving drawing', error],
                })
            })
    } else {
        log.error({
            title: 'Drawing store / updateCurrentDrawingFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['No feature to update', dispatcher],
        })
    }
}
