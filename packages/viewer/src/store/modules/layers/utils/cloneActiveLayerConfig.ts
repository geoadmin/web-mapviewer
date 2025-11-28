import type { GeoAdminGeoJSONLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'
import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'

export default function cloneActiveLayerConfig(
    sourceLayer: Layer,
    activeLayerConfig: Partial<Layer>
): Layer {
    const clone = layerUtils.cloneLayer(sourceLayer)
    if (clone) {
        if (typeof activeLayerConfig.isVisible === 'boolean') {
            clone.isVisible = activeLayerConfig.isVisible
        }
        if (typeof activeLayerConfig.opacity === 'number') {
            clone.opacity = activeLayerConfig.opacity
        }
        if (activeLayerConfig.customAttributes) {
            const { year, updateDelay } = activeLayerConfig.customAttributes
            if (year && clone.timeConfig) {
                timeConfigUtils.updateCurrentTimeEntry(
                    clone.timeConfig,
                    timeConfigUtils.getTimeEntryForYear(
                        clone.timeConfig,
                        typeof year === 'number' ? year : parseInt(year)
                    )
                )
            }
            if (updateDelay && clone.type === LayerType.GEOJSON) {
                ;(clone as GeoAdminGeoJSONLayer).updateDelay = updateDelay
            }
        }
    }
    return clone
}
