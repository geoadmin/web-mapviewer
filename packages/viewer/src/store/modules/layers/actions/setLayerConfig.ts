import type { GeoAdminLayer, LayerTimeConfigEntry } from '@swissgeo/layers'

import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import rerunSearchLayerSearchable from '@/store/modules/layers/utils/rerunSearchLayerSearchable'

/**
 * Sets the configuration of all available layers for this application
 *
 * Will add layers back, if some were already added before the config was changed
 */
export default function setLayerConfig(
    this: LayersStore,
    config: GeoAdminLayer[],
    dispatcher: ActionDispatcher
): void {
    const activeLayerBeforeConfigChange = [...this.activeLayers]
    if (Array.isArray(config)) {
        this.config = [...config]
    }
    this.activeLayers = activeLayerBeforeConfigChange.map((layer) => {
        const layerConfig: GeoAdminLayer | undefined = this.getLayerConfigById(layer.id)
        if (layerConfig) {
            // If we found a layer config we use as it might have changed the i18n translation
            const clone = layerUtils.cloneLayer(layerConfig)
            clone.isVisible = layer.isVisible
            clone.opacity = layer.opacity
            clone.customAttributes = layer.customAttributes
            if (layer.timeConfig && layer.timeConfig.currentTimeEntry && clone.timeConfig) {
                const currentTimeEntry: LayerTimeConfigEntry = layer.timeConfig.currentTimeEntry
                timeConfigUtils.updateCurrentTimeEntry(
                    clone.timeConfig,
                    clone.timeConfig.timeEntries.find(
                        (entry) => entry.timestamp === currentTimeEntry.timestamp
                    )
                )
            }
            return clone
        } else {
            // if no config is found, then it is a layer that is not managed, like for example
            // the KML layers, in this case we take the old active configuration as fallback.
            return layerUtils.cloneLayer(layer)
        }
    })
    rerunSearchLayerSearchable(this.activeLayers)
}
