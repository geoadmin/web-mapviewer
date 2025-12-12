import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

/**
 * Will set the background to the given layer (or layer ID), but only if this layer's configuration
 * states that this layer can be a background layer (isBackground flag)
 */
export default function setBackground(
    this: LayersStore,
    bgLayerId: string | undefined,
    dispatcher: ActionDispatcher
): void {
    if (bgLayerId === undefined || bgLayerId === 'void') {
        // setting it to no background
        this.currentBackgroundLayerId = undefined
    }
    if (bgLayerId && this.getLayerConfigById(bgLayerId)?.isBackground) {
        this.currentBackgroundLayerId = bgLayerId
    } else {
        log.debug({
            title: 'Layers store / setBackground',
            titleColor: LogPreDefinedColor.Red,
            messages: `Layer ${bgLayerId} is not a background layer, ignoring`,
        })
    }
}
