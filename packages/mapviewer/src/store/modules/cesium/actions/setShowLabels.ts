import type { CesiumStore } from '@/store/modules/cesium/types'
import type { ActionDispatcher } from '@/store/types'

export default function setShowLabels(
    this: CesiumStore,
    show: boolean,
    dispatcher: ActionDispatcher
) {
    this.showLabels = show
}
