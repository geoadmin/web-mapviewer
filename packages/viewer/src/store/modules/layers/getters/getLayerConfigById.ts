import type { GeoAdminLayer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types'

export default function getLayerConfigById(
    this: LayersStore
): (layerId: string) => GeoAdminLayer | undefined {
    return (layerId: string) => this.config.find((layer) => layer.id === layerId)
}
