import log from '@swissgeo/log'

import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { loadAllIconSetsFromBackend } from '@/api/icon.api'

export default function loadAvailableIconSets(this: DrawingStore, dispatcher: ActionDispatcher) {
    loadAllIconSetsFromBackend()
        .then((iconSets) => {
            if (iconSets?.length > 0) {
                this.iconSets = iconSets
            }
        })
        .catch((error) => {
            log.error({
                title: 'Drawing store / loadAvailableIconSets',
                messages: ['Error while loading available icon sets', error],
            })
        })
}
