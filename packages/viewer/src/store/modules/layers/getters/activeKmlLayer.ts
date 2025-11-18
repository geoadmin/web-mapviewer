import type { KMLLayer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types/layers'

export default function activeKmlLayer(this: LayersStore): KMLLayer | undefined {
    const kmlLayer = this.activeLayers.find(
        (layer) => layer.type === LayerType.KML && (layer as KMLLayer).isEdited
    )
    if (kmlLayer) {
        return kmlLayer as KMLLayer
    }
    return undefined
}
