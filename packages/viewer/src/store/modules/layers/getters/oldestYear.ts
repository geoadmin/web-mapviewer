import { timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types/layers'

import { DEFAULT_OLDEST_YEAR } from '@/config/time.config'

export default function oldestYear(this: LayersStore): number {
    return this.config.reduce((oldestYear, layer) => {
        if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer)) {
            return oldestYear
        }
        const oldestLayerYear: number | undefined = timeConfigUtils.getYearFromLayerTimeEntry(
            layer.timeConfig.timeEntries.slice(-1)[0]!
        )
        if (oldestLayerYear && oldestYear > oldestLayerYear) {
            return oldestLayerYear
        }
        return oldestYear
    }, DEFAULT_OLDEST_YEAR)
}
