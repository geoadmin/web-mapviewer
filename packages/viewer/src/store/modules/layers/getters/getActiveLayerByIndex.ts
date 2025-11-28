import type { Layer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types/layers'

export default function getActiveLayerByIndex(
    this: LayersStore
): (index: number) => Layer | undefined {
    return (index: number) => this.activeLayers.at(index)
}
