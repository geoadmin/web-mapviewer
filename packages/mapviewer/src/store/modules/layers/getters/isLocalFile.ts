import type { KMLLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'

export default function isLocalFile(): (layer?: Layer) => boolean {
    return (layer?: Layer): boolean => {
        if (!layer) {
            return false
        }
        const isBaseUrlValidUrl = /^\w+:\/\//.test(layer?.baseUrl)
        return (
            layer &&
            !isBaseUrlValidUrl &&
            (layer.isExternal || (layer.type === LayerType.KML && !(layer as KMLLayer).adminId))
        )
    }
}
