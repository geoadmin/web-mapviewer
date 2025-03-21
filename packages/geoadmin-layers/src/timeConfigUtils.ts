import { isTimestampYYYYMMDD } from '@geoadmin/numbers'

import type { Layer } from '@/layers'

import {
    ALL_YEARS_TIMESTAMP,
    CURRENT_YEAR_TIMESTAMP,
    type LayerTimeConfig,
    type LayerTimeConfigEntry,
} from '@/timeConfig'

export const hasTimestamp = (timeConfig: LayerTimeConfig, timestamp: string): boolean =>
    !!timeConfig.timeEntries.find((entry: LayerTimeConfigEntry) => entry.timestamp === timestamp)

export const getTimeEntryForYear = (timeConfig: LayerTimeConfig, year: number) =>
    timeConfig.timeEntries.find((entry: LayerTimeConfigEntry) => entry.year === year) ?? null

export const updateCurrentTimeEntry = (
    timeConfig: LayerTimeConfig,
    entry: LayerTimeConfigEntry | string
) => {
    let currentTimeEntry

    if (typeof entry === 'string') {
        currentTimeEntry = timeConfig.timeEntries.find((e) => e.timestamp === entry) ?? null
    } else {
        currentTimeEntry = entry
    }

    if (currentTimeEntry) {
        timeConfig.currentTimeEntry = currentTimeEntry

        timeConfig.currentTimestamp = timeConfig.currentTimeEntry?.timestamp ?? undefined
        timeConfig.currentYear = timeConfig.currentTimeEntry?.year ?? undefined
    }
}

export const makeTimeConfigEntry = (timestamp: string): LayerTimeConfigEntry => {
    let year
    if (timestamp === ALL_YEARS_TIMESTAMP || timestamp === CURRENT_YEAR_TIMESTAMP) {
        // for "all" and "current" timestamps we use it as well as year to be added in the UI selection
        // as well as in the URL year attribute of layers param.
        year = timestamp
    } else if (timestamp.startsWith('9999')) {
        // TODO PB-680 clean up "all" hack
        // Currently the backends (mf-chsdi3 for layerConfig and WMTS) are using a hack to describe "all"
        // by using a timestamp with the year 9999 (we have in my knowledge three type of "all" WMTS timestmaps
        //  1. 9999      (e.g. ch.swisstopo.lubis-terrestrische_aufnahmen)
        //  2. 99990101  (e.g. ch.astra.unfaelle-personenschaeden_alle)
        //  3. 99991231  (e.g. ch.swisstopo.lubis-luftbilder-dritte-firmen)
        year = ALL_YEARS_TIMESTAMP
    } else {
        if (isTimestampYYYYMMDD(timestamp)) {
            year = parseInt(timestamp.substring(0, 4))
        } else {
            const date = new Date(timestamp)
            if (!isNaN(date.getFullYear())) {
                year = date.getFullYear()
            } else {
                year = null
            }
        }
    }

    return {
        timestamp,
        year,
    }
}

export const makeTimeConfig = (
    behaviour = null,
    timeEntries: LayerTimeConfigEntry[] = []
): LayerTimeConfig => {
    const timeConfig: LayerTimeConfig = {
        timeEntries: timeEntries,
        behaviour: behaviour,
        years: timeEntries
            .map((entry) => entry.year)
            .filter((entry: number | string | null) => entry !== null),
    }

    if ((behaviour === 'last' || !behaviour) && timeEntries.length > 0) {
        updateCurrentTimeEntry(timeConfig, timeEntries[0])
    } else if (behaviour) {
        updateCurrentTimeEntry(timeConfig, behaviour)
    }

    return timeConfig
}

export const hasMultipleTimestamps = (layer: Layer): boolean => {
    return (layer.timeConfig?.timeEntries?.length || 0) > 1
}
