import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

export default function setHighlightedFeatureId(
    this: FeaturesStore,
    highlightedFeatureId: string | undefined,
    dispatcher: ActionDispatcher
) {
    this.highlightedFeatureId = highlightedFeatureId
}
