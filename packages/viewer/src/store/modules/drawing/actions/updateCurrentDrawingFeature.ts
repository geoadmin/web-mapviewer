import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { EditableFeature } from '@/api/features/types'
import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'
import type { FeatureStyleColor, FeatureStyleSize } from '@/utils/featureStyle/types'

import { generateIconURL } from '@/api/icons'
import debounceSaveDrawing from '@/store/modules/drawing/utils/debounceSaveDrawing'
import useProfileStore from '@/store/modules/profile'
import { calculateTextOffset, MEDIUM, RED } from '@/utils/featureStyle'

export default function updateCurrentDrawingFeature(
    this: DrawingStore,
    valuesToUpdate: Partial<EditableFeature>,
    dispatcher: ActionDispatcher
) {
    if (this.feature.current) {
        this.save.state = 'UNSAVED_CHANGES'

        let needIconUrlRefresh = false

        Object.assign(this.feature.current, valuesToUpdate)

        // keeping values as preferred, if present, so that the next time the user draws, the values are used
        if (valuesToUpdate.iconSize) {
            this.edit.preferred.size = valuesToUpdate.iconSize
            needIconUrlRefresh = true
        }
        if (valuesToUpdate.textSize) {
            this.edit.preferred.size = valuesToUpdate.textSize
        }
        if (valuesToUpdate.fillColor) {
            this.edit.preferred.color = valuesToUpdate.fillColor
            needIconUrlRefresh = true
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

        if (this.feature.current.icon && needIconUrlRefresh) {
            const newIconSize: FeatureStyleSize =
                valuesToUpdate.iconSize ?? this.feature.current.iconSize ?? MEDIUM
            const newIconColor: FeatureStyleColor =
                valuesToUpdate.fillColor ?? this.feature.current.fillColor ?? RED
            this.feature.current.icon.imageURL = generateIconURL(
                this.feature.current.icon,
                newIconColor,
                newIconSize
            )
        }

        const profileStore = useProfileStore()
        // updating the profile feature if the currently drawn feature is the profile feature
        if (profileStore.feature?.id === this.feature.current.id) {
            profileStore.setProfileFeature(this.feature.current, dispatcher)
        }

        debounceSaveDrawing()
            .then(() => {
                this.save.state = 'SAVED'
            })
            .catch((error) => {
                this.save.state = 'SAVE_ERROR'
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
