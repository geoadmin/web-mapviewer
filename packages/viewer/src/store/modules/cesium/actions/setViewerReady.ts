import type { CesiumStore } from '@/store/modules/cesium/types/cesium'
import type { ActionDispatcher } from '@/store/types'

export default function setViewerReady(
    this: CesiumStore,
    isReady: boolean,
    dispatcher: ActionDispatcher
) {
    this.isViewerReady = isReady
}
