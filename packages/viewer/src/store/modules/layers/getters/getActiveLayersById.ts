import type { Layer } from '@swissgeo/layers'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'

import matchTwoLayers from '@/store/modules/layers/utils/matchTwoLayers'

export default function getActiveLayersById(
    this: LayersStore
): (layerId: string, options?: LayerActionFilter) => Layer[] {
    return (layerId: string, options?: LayerActionFilter) => {
        const { isExternal, baseUrl } = options ?? {}
        return this.activeLayers.filter((layer) =>
            matchTwoLayers(layerId, isExternal, baseUrl, layer)
        )
    }
}
