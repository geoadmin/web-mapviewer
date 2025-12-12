import { timeConfigUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types'

import { DEFAULT_YOUNGEST_YEAR } from '@/config/time.config'

export default function youngestYear(this: LayersStore): number {
    return this.config.reduce((youngestYear, layer): number => {
        if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer)) {
            return youngestYear
        }
        const youngestLayerYear: number | undefined = timeConfigUtils.getYearFromLayerTimeEntry(
            layer.timeConfig.timeEntries[0]!
        )
        if (youngestLayerYear && youngestYear < youngestLayerYear) {
            return youngestLayerYear
        }
        return youngestYear
    }, DEFAULT_YOUNGEST_YEAR)
}
