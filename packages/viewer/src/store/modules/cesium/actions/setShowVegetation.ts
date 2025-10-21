import type { CesiumStore } from '@/store/modules/cesium/types/cesium'
import type { ActionDispatcher } from '@/store/types'

export default function setShowVegetation(
    this: CesiumStore,
    show: boolean,
    dispatcher: ActionDispatcher
) {
    this.showVegetation = show
}
