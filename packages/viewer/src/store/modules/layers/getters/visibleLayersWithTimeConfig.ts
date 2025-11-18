import type { Layer } from '@swissgeo/layers'

import { timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types/layers'

export default function visibleLayersWithTimeConfig(this: LayersStore): Layer[] {
    // Here we cannot take the getter visibleLayers as it also contains the preview and system
    // layers as well as the layer without valid current timeEntry are filtered out
    return this.activeLayers.filter(
        (layer) => layer.isVisible && timeConfigUtils.hasMultipleTimestamps(layer)
    )
}
