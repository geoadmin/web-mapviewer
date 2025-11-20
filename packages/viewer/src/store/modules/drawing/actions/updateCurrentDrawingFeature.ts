import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { EditableFeature } from '@/api/features.api'
import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'
import type { FeatureStyleColor, FeatureStyleSize } from '@/utils/featureStyleUtils'

import { generateIconURL } from '@/api/icon.api'
import { DrawingSaveState } from '@/store/modules/drawing/types'
import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useProfileStore from '@/store/modules/profile'
import { calculateTextOffset, MEDIUM, RED } from '@/utils/featureStyleUtils'

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
            this.edit.preferred.size = valuesToUpdate.iconSize
        }
        if (valuesToUpdate.textSize) {
            this.edit.preferred.size = valuesToUpdate.textSize
        }
        if (valuesToUpdate.fillColor) {
            this.edit.preferred.color = valuesToUpdate.fillColor
            // refreshing the icon color if present
            if (this.feature.current.icon) {
                this.feature.current.icon.imageURL = generateIconURL(
                    this.feature.current.icon,
                    valuesToUpdate.fillColor
                )
            }
        }
        if (valuesToUpdate.textColor) {
            this.edit.preferred.color = valuesToUpdate.textColor
        }
        if (valuesToUpdate.textPlacement) {
            this.edit.preferred.textPlacement = valuesToUpdate.textPlacement

            if (
                this.feature.current.textSize &&
                this.feature.current.iconSize &&
                this.feature.current.icon
            ) {
                this.feature.current.textOffset = calculateTextOffset(
                    this.feature.current.textSize.textScale,
                    this.feature.current.iconSize.iconScale,
                    this.feature.current.icon.anchor,
                    this.feature.current.icon.size,
                    this.edit.preferred.textPlacement,
                    this.feature.current.title
                )
            }
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
