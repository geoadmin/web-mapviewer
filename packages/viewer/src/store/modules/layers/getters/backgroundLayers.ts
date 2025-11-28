import type { GeoAdminLayer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types/layers'

export default function backgroundLayers(this: LayersStore): GeoAdminLayer[] {
    return this.config.filter((layer: GeoAdminLayer) => layer.isBackground && layer.idIn3d)
}
