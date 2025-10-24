import type { GeoAdminLayer, LayerTimeConfigEntry } from '@swissgeo/layers'

import { timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

/** Set layer current year */
export default function setTimedLayerCurrentTimeEntry(
    this: LayersStore,
    index: number,
    timeEntry: LayerTimeConfigEntry | undefined,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)

    if (layer && layer.timeConfig) {
        timeConfigUtils.updateCurrentTimeEntry(layer.timeConfig, timeEntry)

        // if this layer has a 3D counterpart, we also update its time entry (keep it in sync)
        if ('idIn3d' in layer && layer.idIn3d !== undefined) {
            const geoadminLayer = layer as GeoAdminLayer
            const layerIn3d = this.getLayerConfigById(geoadminLayer.idIn3d as string)
            if (layerIn3d?.timeConfig) {
                timeConfigUtils.updateCurrentTimeEntry(layerIn3d.timeConfig, timeEntry)
            }
        }
    } else {
        log.error({
            title: 'Layers store / setTimedLayerCurrentTimeEntry',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to setTimedLayerCurrentTimeEntry: invalid index or layer (not time-enabled)',
                index,
                layer,
                dispatcher,
            ],
        })
    }
}
