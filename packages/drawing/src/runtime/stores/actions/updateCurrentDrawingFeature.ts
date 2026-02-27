import type { EditableFeature } from '@swissgeo/api'
import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import { iconsAPI } from '@swissgeo/api'
import { featureStyleUtils } from '@swissgeo/api/utils'
import log from '@swissgeo/log'
import { debounceSaveDrawing, logConfig } from '#imports'

export default function updateCurrentDrawingFeature(
    this: DrawingStore,
    valuesToUpdate: Partial<EditableFeature>,
    dispatcher: ActionDispatcher
) {
    if (this.feature.current) {
        if (this.online) {
            this.save.state = 'UNSAVED_CHANGES'
        }

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
                this.feature.current.icon.imageURL = iconsAPI.generateIconURL(
                    this.feature.current.icon,
                    valuesToUpdate.fillColor.fill
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
                this.feature.current.textOffset = featureStyleUtils.calculateTextOffset(
                    this.feature.current.textSize.textScale,
                    this.feature.current.iconSize.iconScale,
                    this.feature.current.icon.anchor,
                    this.feature.current.icon.size,
                    this.edit.preferred.textPlacement,
                    this.feature.current.title
                )
            }
        }

        if (this.online) {
            debounceSaveDrawing()
                .then(() => {
                    this.save.state = 'SAVED'
                })
                .catch((error) => {
                    this.save.state = 'SAVE_ERROR'
                    log.error({
                        ...logConfig('store - updateCurrentDrawingFeature'),
                        messages: ['Error while saving drawing', error],
                    })
                })
        } else {
            log.debug({
                ...logConfig('store - updateCurrentDrawingFeature'),
                messages: ['Drawing is not online, not saving', this.online, dispatcher],
            })
        }
    } else {
        log.error({
            ...logConfig('store - updateCurrentDrawingFeature'),
            messages: ['No feature to update', dispatcher],
        })
    }
}
