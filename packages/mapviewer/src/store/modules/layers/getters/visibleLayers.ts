import type { Layer, KMLLayer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'
import { timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types'

export default function visibleLayers(this: LayersStore): Layer[] {
    const visibleLayers = this.activeLayers.filter((layer) => {
        // If the currently selected time entry is null (aka, the time selected has no data),
        // it is like the layer is not visible (even though the checkbox is still active)
        if (
            layer.timeConfig &&
            timeConfigUtils.hasMultipleTimestamps(layer) &&
            layer.timeConfig.currentTimeEntry === null
        ) {
            return false
        }
        return layer.isVisible
    })
    if (this.previewLayer) {
        visibleLayers.push(this.previewLayer)
    }
    if (this.systemLayers.length > 0) {
        visibleLayers.push(...this.systemLayers.filter((layer) => layer.isVisible))
    }
    return visibleLayers.filter((layer) => {
        // we filter out any "drawing" layer that are currently edited (it will be loaded by the drawing module onto the map)
        if (layer.type === LayerType.KML) {
            return !(layer as KMLLayer).isEdited
        }
        return true
    })
}
