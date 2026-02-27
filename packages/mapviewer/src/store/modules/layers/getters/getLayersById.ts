import type { Layer } from '@swissgeo/layers'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types'

import matchTwoLayers from '@/store/modules/layers/utils/matchTwoLayers'

export default function getLayersById(
    this: LayersStore
): (layerId: string, options?: LayerActionFilter) => Layer[] {
    return (layerId: string, options?: LayerActionFilter) => {
        const { isExternal, baseUrl } = options ?? {}
        const layers = this.activeLayers.filter((layer) =>
            matchTwoLayers(layerId, isExternal, baseUrl, layer as Layer)
        ) as Layer[]
        if (
            this.previewLayer !== undefined &&
            matchTwoLayers(layerId, isExternal, baseUrl, this.previewLayer as Layer)
        ) {
            layers.push(this.previewLayer as Layer)
        }
        return layers
    }
}
