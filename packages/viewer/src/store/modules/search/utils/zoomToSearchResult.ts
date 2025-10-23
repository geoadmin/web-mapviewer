import type { LayerFeatureSearchResult, LocationSearchResult } from '@/api/search.api'
import type { ActionDispatcher } from '@/store/types'

import usePositionStore from '@/store/modules/position'

export default function zoomToSearchResult(
    entry: LocationSearchResult | LayerFeatureSearchResult,
    dispatcher: ActionDispatcher
): void {
    const positionStore = usePositionStore()
    if (entry.extent) {
        positionStore.zoomToExtent({ extent: entry.extent }, dispatcher)
    } else if (entry.zoom && entry.coordinate) {
        positionStore.setCenter(entry.coordinate, dispatcher)
        positionStore.setZoom(entry.zoom, dispatcher)
    }
}
