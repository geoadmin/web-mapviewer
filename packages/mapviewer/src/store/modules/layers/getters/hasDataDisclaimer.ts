import type { KMLLayer, Layer } from '@swissgeo/layers'

import { EXTERNAL_PROVIDER_WHITELISTED_URL_REGEXES } from '@swissgeo/staging-config/constants'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types'

export default function hasDataDisclaimer(
    this: LayersStore
): (layerId: string, options?: LayerActionFilter) => boolean {
    return (layerId: string, options?: LayerActionFilter) =>
        this.getActiveLayersById(layerId, options).some(
            (layer: Layer) =>
                (layer && layer.isExternal && !checkLayerUrlWhitelisting(options?.baseUrl)) ||
                (layer.type === 'KML' && !(layer as KMLLayer).adminId)
        )
}

function checkLayerUrlWhitelisting(layerBaseUrl?: string): boolean {
    if (!layerBaseUrl) {
        return false
    }
    return EXTERNAL_PROVIDER_WHITELISTED_URL_REGEXES.some((regex) => !!layerBaseUrl.match(regex))
}
