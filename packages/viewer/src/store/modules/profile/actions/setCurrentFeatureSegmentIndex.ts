import type { ProfileStore } from '@/store/modules/profile/types/profile'
import type { ActionDispatcher } from '@/store/types'

export default function setCurrentFeatureSegmentIndex(
    this: ProfileStore,
    index: number,
    dispatcher: ActionDispatcher
): void {
    this.currentFeatureGeometryIndex = index ?? 0
}
