import type { DebugStore } from '@/store/modules/debug/types/debug'
import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'

export default function setHasBaseUrlOverrides(
    this: DebugStore,
    hasOverrides: boolean,
    dispatcher: ActionDispatcher
) {
    this.hasBaseUrlOverrides = hasOverrides
    useLayersStore().loadLayersConfig({ changeLayersOnTopicChange: false }, dispatcher)
}
