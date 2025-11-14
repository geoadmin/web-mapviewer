import type { GeoAdminLayer, Layer } from '@swissgeo/layers'

import redoSearch from '@/store/modules/search/utils/redoSearch'

export default function rerunSearchLayerSearchable(layers: Layer[]): void {
    const internalLayers = layers.filter(
        (layer) => typeof layer !== 'string' && !layer.isExternal
    ) as GeoAdminLayer[]

    // rerunning search if layer added at startup are searchable, as the search has already been run
    // if swissearch URL param is set (and layer features for searchable layers won't be available)
    if (internalLayers.some((layer) => layer && layer.searchable)) {
        redoSearch()
    }
}
