import type { KMLLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'

export default function hasDataDisclaimer(
    this: LayersStore
): (layerId: string, options?: LayerActionFilter) => boolean {
    return (layerId: string, options?: LayerActionFilter) =>
        this.getActiveLayersById(layerId, options).some(
            (layer: Layer) =>
                layer &&
                (layer.isExternal || (layer.type === LayerType.KML && !(layer as KMLLayer).adminId))
        )
}
