import type { CesiumStore } from '@/store/modules/cesium/types/cesium'
import type { ActionDispatcher } from '@/store/types'

export default function setShowConstructionsBuildings(
    this: CesiumStore,
    show: boolean,
    dispatcher: ActionDispatcher
) {
    this.showConstructions = show
    this.showBuildings = show
}
