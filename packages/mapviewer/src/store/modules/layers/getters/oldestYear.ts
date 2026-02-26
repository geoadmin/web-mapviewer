import type { LayerTimeConfigEntry, Layer } from '@swissgeo/layers'

import { timeConfigUtils } from '@swissgeo/layers/utils'
import { DEFAULT_OLDEST_YEAR } from '@swissgeo/staging-config/constants'

import type { LayersStore } from '@/store/modules/layers/types'

export default function oldestYear(this: LayersStore): number {
    return this.config.reduce((oldestYear, layer) => {
        if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer as Layer)) {
            return oldestYear
        }
        const sortedEntries = layer.timeConfig.timeEntries.toSorted((a, b) => {
            if (a.year === undefined) {
                return 1
            }
            if (b.year === undefined) {
                return -1
            }
            return Number(b.year) - Number(a.year)
        }) as LayerTimeConfigEntry[]
        const oldestLayerYear: number | undefined = timeConfigUtils.getYearFromLayerTimeEntry(
            sortedEntries.slice(-1)[0]
        )

        if (oldestLayerYear && oldestYear > oldestLayerYear) {
            return oldestLayerYear
        }
        return oldestYear
    }, DEFAULT_OLDEST_YEAR)
}
