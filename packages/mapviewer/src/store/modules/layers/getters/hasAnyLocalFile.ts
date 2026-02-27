import type { Layer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function hasAnyLocalFile(this: LayersStore): boolean {
    return this.activeLayers.some((layer) => this.isLocalFile(layer as Layer))
}
