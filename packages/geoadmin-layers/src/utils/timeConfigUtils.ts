import { isTimestampYYYYMMDD } from '@geoadmin/numbers'

import type { Layer } from '@/types'

import {
    ALL_YEARS_TIMESTAMP,
    CURRENT_YEAR_TIMESTAMP,
    type LayerTimeConfig,
    type LayerTimeConfigEntry,
} from '@/types'

export const hasTimestamp = (timeConfig: LayerTimeConfig, timestamp: string): boolean =>
    timeConfig.timeEntries.some((entry: LayerTimeConfigEntry) => entry.timestamp === timestamp)

export const getTimeEntryForYear = (
    timeConfig: LayerTimeConfig,
    year: number
): LayerTimeConfigEntry | undefined =>
    timeConfig.timeEntries.find((entry: LayerTimeConfigEntry) => entry.year === year)

export const updateCurrentTimeEntry = (
    timeConfig: LayerTimeConfig,
    entry: LayerTimeConfigEntry | string
) => {
    let currentTimeEntry: LayerTimeConfigEntry | undefined

    if (typeof entry === 'string') {
        currentTimeEntry = timeConfig.timeEntries.find((e) => e.timestamp === entry)
    } else {
        currentTimeEntry = entry
    }

    timeConfig.currentTimeEntry = currentTimeEntry
    if (currentTimeEntry) {
        timeConfig.currentTimestamp = currentTimeEntry.timestamp
        timeConfig.currentYear = currentTimeEntry.year
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
            }
        }
    }

    return {
        timestamp,
        year,
    }
}

export const makeTimeConfig = (
    behaviour = undefined,
    timeEntries: LayerTimeConfigEntry[] = []
): LayerTimeConfig | undefined => {
    if (timeEntries.length === 0) {
        return
    }
    const timeConfig: LayerTimeConfig = {
        timeEntries: timeEntries,
        behaviour,
        years: timeEntries
            .map((entry) => entry.year)
            .filter((entry?: number | string) => entry !== undefined),
    }
    /*
     * Here we will define what is the first "currentTimeEntry" for this configuration.
     * We will simplify the two approaches that exists for WMS and WMTS.
     * The first value will depend on what is in 'behaviour'
     *
     * With WMS the behaviour can be :
     *  - 'last' : the most recent year has to be picked
     *  - 'all' : all years must be picked (so the year 9999 or no year should be specified in the URL)
     *  - any valid year that has an equivalent in 'timeEntries'
     *
     * With WMTS the behaviour can be :
     *  - 'current' : 'current' is a valid timestamp in regard to WMTS URL norm so we need to do about the same as
     *                with WMS and keep this information for later use
     *  - 'last' : same as WMS, we pick the most recent timestamp from 'timestamps'
     *  - any valid year that is in 'timestamps'
     *  - nothing : we then have to pick the first timestamp of the timestamps as default (same as if it was 'last')
     *
     * First let's tackle layers that have "last" as a timestamp (can be both WMS and WMTS layers).
     * We will return, well, the last timestamp (the most recent) of the timestamps (if there are some)
     * or if nothing has been defined in the behaviour, but there are some timestamps defined, we take the first.
     */
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
