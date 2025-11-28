import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'

import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { loadAllIconSetsFromBackend } from '@/api/icon.api'
import useUIStore from '@/store/modules/ui'
import { getIcon, parseIconUrl } from '@/utils/kmlUtils'

export default function loadAvailableIconSets(
    this: DrawingStore,
    dispatcher: ActionDispatcher
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        loadAllIconSetsFromBackend()
            .then((iconSets) => {
                if (iconSets?.length > 0) {
                    this.iconSets = iconSets
                }
                if (this.feature.all.length > 0) {
                    log.debug({
                        title: 'Drawing store / loadAvailableIconSets',
                        titleColor: LogPreDefinedColor.Lime,
                        messages: ['New icon sets available, updating all drawing features'],
                    })
                }
                this.feature.all.forEach((feature) => {
                    if (feature.icon) {
                        const iconArgs = parseIconUrl(feature.icon.imageURL)
                        const icon = getIcon(
                            iconArgs,
                            undefined /*iconStyle*/,
                            this.iconSets,
                            () => {
                                const uiStore = useUIStore()
                                uiStore.addWarnings(
                                    new WarningMessage('kml_icon_set_not_found', {
                                        iconSetName: iconArgs!.set,
                                    }),
                                    dispatcher
                                )
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
                    title: 'Drawing store / loadAvailableIconSets',
                    titleColor: LogPreDefinedColor.Lime,
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
