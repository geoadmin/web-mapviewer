import type { GeoAdminLayer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function backgroundLayers(this: LayersStore): GeoAdminLayer[] {
    return this.config.filter((layer) => layer.isBackground && layer.idIn3d) as GeoAdminLayer[]
}
