import type { GeoAdminLayer } from '@swissgeo/layers'

import { timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

export default function setTimedLayerCurrentYear(
    this: LayersStore,
    index: number,
    year: number | undefined,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (!layer) {
        throw new Error(`Failed to setTimedLayerCurrentYear: invalid index ${index}`)
    }
    // checking that the year exists in this timeConfig
    if (!layer.timeConfig) {
        throw new Error(
            `Failed to setTimedLayerCurrentYear: layer at index ${index} is not a timed layer`
        )
    }
    timeConfigUtils.updateCurrentTimeEntry(
        layer.timeConfig,
        year !== undefined ? timeConfigUtils.getTimeEntryForYear(layer.timeConfig, year) : undefined
    )
    // if this layer has a 3D counterpart, we also update its timestamp (keep it in sync)
    if ('idIn3d' in layer && layer.idIn3d !== undefined) {
        const layerIn3d = this.getLayerConfigById((layer as GeoAdminLayer).idIn3d!)
        if (layerIn3d?.timeConfig) {
            timeConfigUtils.updateCurrentTimeEntry(
                layerIn3d.timeConfig,
                year !== undefined
                    ? timeConfigUtils.getTimeEntryForYear(layerIn3d.timeConfig, year)
                    : undefined
            )
        }
    }
}
