import type { Layer, LayerTimeConfigEntry } from '@swissgeo/layers'

import { timeConfigUtils } from '@swissgeo/layers/utils'
import { DEFAULT_YOUNGEST_YEAR } from '@swissgeo/staging-config/constants'

import type { LayersStore } from '@/store/modules/layers/types'

export default function youngestYear(this: LayersStore): number {
    return this.config.reduce((youngestYear, layer): number => {
        if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer as Layer)) {
            return youngestYear
        }
        const sortedEntries = layer.timeConfig.timeEntries.sort((a, b) => {
            if (a.year === undefined) {
                return 1
            }
            if (b.year === undefined) {
                return -1
            }
            return Number(b.year) - Number(a.year)
        }) as LayerTimeConfigEntry[]
        const youngestLayerYear: number | undefined = timeConfigUtils.getYearFromLayerTimeEntry(
            sortedEntries[0]
        )

        if (youngestLayerYear && youngestYear < youngestLayerYear) {
            return youngestLayerYear
        }
        return youngestYear
    }, DEFAULT_YOUNGEST_YEAR)
}
