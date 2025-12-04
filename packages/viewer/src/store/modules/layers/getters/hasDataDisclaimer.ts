import type { KMLLayer, Layer } from '@swissgeo/layers'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types'

export default function hasDataDisclaimer(
    this: LayersStore
): (layerId: string, options?: LayerActionFilter) => boolean {
    return (layerId: string, options?: LayerActionFilter) =>
        this.getActiveLayersById(layerId, options).some(
            (layer: Layer) =>
                layer &&
                (layer.isExternal || (layer.type === 'KML' && !(layer as KMLLayer).adminId))
        )
}
