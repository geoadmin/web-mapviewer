import type { Layer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function currentBackgroundLayer(this: LayersStore): Layer | undefined {
    if (!this.currentBackgroundLayerId) {
        return
    }
    return this.getLayerConfigById(this.currentBackgroundLayerId)
}
