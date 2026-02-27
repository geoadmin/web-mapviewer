import type { EditableFeature } from '@swissgeo/api'
import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import { iconsAPI } from '@swissgeo/api'
import { kmlUtils } from '@swissgeo/api/utils'
import log from '@swissgeo/log'
import { logConfig } from '#imports'

export default function loadAvailableIconSets(
    this: DrawingStore,
    dispatcher: ActionDispatcher
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        iconsAPI
            .loadAllIconSetsFromBackend(this.debug.staging)
            .then((iconSets) => {
                if (iconSets?.length > 0) {
                    this.iconSets = iconSets
                }
                if (this.feature.all.length > 0) {
                    log.debug({
                        ...logConfig('store - loadAvailableIconSets'),
                        messages: ['New icon sets available, updating all drawing features'],
                    })
                }
                this.feature.all.forEach((feature: EditableFeature) => {
                    if (feature.icon) {
                        const iconArgs = kmlUtils.parseIconUrl(feature.icon.imageURL)
                        const icon = kmlUtils.getIcon(
                            iconArgs,
                            undefined /* iconStyle */,
                            this.iconSets,
                            () => {
                                log.warn({
                                    ...logConfig('store - loadAvailableIconSets'),
                                    messages: [
                                        'The icon set described in the KML was not found',
                                        iconArgs!.set,
                                    ],
                                })
                            }
                        )
                        if (icon) {
                            feature.icon = icon
                        }
                    }
                })
                resolve()
            })
            .catch((error) => {
                log.error({
                    ...logConfig('store - loadAvailableIconSets'),
                    messages: ['Error while loading available icon sets', error],
                })
                if (error instanceof Error) {
                    reject(error)
                } else {
                    reject(new Error('Unknown error', { cause: error }))
                }
            })
    })
}
