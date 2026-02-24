import type { Layer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function visibleLayerOnTop(this: LayersStore): Layer | undefined {
    if (this.visibleLayers.length > 0) {
        return this.visibleLayers.slice(-1)[0]
    }
    return undefined
}
