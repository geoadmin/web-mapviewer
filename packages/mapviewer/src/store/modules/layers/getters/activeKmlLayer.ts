import type { KMLLayer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function activeKmlLayer(this: LayersStore): KMLLayer | undefined {
    const kmlLayer = this.activeLayers.find(
        (layer) => layer.type === 'KML' && (layer as KMLLayer).isEdited
    )
    if (kmlLayer) {
        return kmlLayer as KMLLayer
    }
    return undefined
}
