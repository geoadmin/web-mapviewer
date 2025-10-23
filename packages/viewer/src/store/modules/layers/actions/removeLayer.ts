import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import matchTwoLayers from '@/store/modules/layers/utils/matchTwoLayers'

export default function removeLayer(
    this: LayersStore,
    index: number,
    dispatcher: ActionDispatcher
): void
export default function removeLayer(
    this: LayersStore,
    layerId: string,
    dispatcher: ActionDispatcher
): void
export default function removeLayer(
    this: LayersStore,
    layerId: string,
    options: LayerActionFilter,
    dispatcher: ActionDispatcher
): void

export default function removeLayer(
    this: LayersStore,
    input: number | string,
    optionsOrDispatcher: LayerActionFilter | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as LayerActionFilter) : {}
    const { baseUrl, isExternal } = options

    if (typeof input === 'string') {
        this.activeLayers = this.activeLayers.filter(
            (layer) => !matchTwoLayers(input, isExternal, baseUrl, layer)
        )
    } else {
        this.activeLayers.splice(input, 1)
    }
}
