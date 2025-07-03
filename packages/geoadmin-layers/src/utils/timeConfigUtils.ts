import log from '@geoadmin/log'
import { isTimestampYYYYMMDD } from '@geoadmin/numbers'
import { Interval } from 'luxon'

import {
    type Layer,
    type LayerTimeConfig,
    type LayerTimeConfigEntry,
    YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA,
} from '@/types'

export const hasTimestamp = (timeConfig: LayerTimeConfig, timestamp: string): boolean =>
    timeConfig.timeEntries.some((entry: LayerTimeConfigEntry) => entry.timestamp === timestamp)

export const getTimeEntryForYear = (
    timeConfig: LayerTimeConfig,
    year: number
): LayerTimeConfigEntry | undefined => {
    const yearAsInterval = Interval.fromISO(`${year}-01-01/P1Y`)
    return timeConfig.timeEntries.find((entry: LayerTimeConfigEntry) => {
        if (entry.nonTimeBasedValue && ['all', 'current'].includes(entry.nonTimeBasedValue)) {
            return year === YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA
        }
        if (yearAsInterval.isValid && entry.interval) {
            return yearAsInterval.intersection(entry.interval) !== null
        }
        return false
    })
}

export const updateCurrentTimeEntry = (
    timeConfig: LayerTimeConfig,
    entryOrTimestamp: LayerTimeConfigEntry | string | undefined
) => {
    let currentTimeEntry: LayerTimeConfigEntry | undefined

    if (typeof entryOrTimestamp === 'string') {
        currentTimeEntry = timeConfig.timeEntries.find((e) => e.timestamp === entryOrTimestamp)
    } else {
        currentTimeEntry = entryOrTimestamp
    }

    timeConfig.currentTimeEntry = currentTimeEntry
}

export const makeTimeConfigEntry = (timestamp: string): LayerTimeConfigEntry => {
    let interval: Interval | undefined
    let nonTimeBasedValue: string | undefined
    if (timestamp.startsWith('9999')) {
        // TODO PB-680 clean up "all" hack
        // Currently the backends (mf-chsdi3 for layerConfig and WMTS) are using a hack to describe "all"
        // by using a timestamp with the year 9999 (we have in my knowledge three type of "all" WMTS timestmaps
        //  1. 9999      (e.g. ch.swisstopo.lubis-terrestrische_aufnahmen)
        //  2. 99990101  (e.g. ch.astra.unfaelle-personenschaeden_alle)
        //  3. 99991231  (e.g. ch.swisstopo.lubis-luftbilder-dritte-firmen)
        nonTimeBasedValue = 'all'
    } else {
        let year: string | undefined
        let month: string | undefined
        let day: string | undefined
        if (isTimestampYYYYMMDD(timestamp)) {
            year = timestamp.substring(0, 4)
            month = timestamp.substring(4, 6)
            day = timestamp.substring(6, 8)
        } else {
            const date = new Date(timestamp)
            if (!isNaN(date.getFullYear())) {
                year = date.getFullYear().toString().padStart(4, '0')
            }
            if (!isNaN(date.getMonth())) {
                // getMonth returns value between 0 and 11
                month = (date.getMonth() + 1).toString().padStart(2, '0')
            }
            if (!isNaN(date.getDate())) {
                day = date.getDate().toString().padStart(2, '0')
            }
        }
        if (year !== undefined && month !== undefined && day !== undefined) {
            interval = Interval.fromISO(`${year}-${month}-${day}/P1D`)
        } else if (year !== undefined && month !== undefined) {
            interval = Interval.fromISO(`${year}-${month}-01/P1M`)
        } else if (year !== undefined) {
            interval = Interval.fromISO(`${year}-01-01/P1Y`)
        }
    }

    // Could not parse any time interval with the input, passing the timestamp as is
    if (interval === undefined || !interval.isValid) {
        nonTimeBasedValue = timestamp
    }
    if (interval && !interval.isValid) {
        log.debug('[@geoadmin/layers] invalid interval for timestamp', timestamp)
        interval = undefined
    }

    return {
        timestamp,
        interval,
        nonTimeBasedValue,
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

export const getYearFromLayerTimeEntry = (timeEntry: LayerTimeConfigEntry): number | undefined => {
    if (timeEntry.nonTimeBasedValue && ['all', 'current'].includes(timeEntry.nonTimeBasedValue)) {
        return YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA
    }
    if (timeEntry.interval && timeEntry.interval.start?.year !== undefined) {
        return timeEntry.interval.start.year
    }
    return undefined
}

export const getTimeEntryForInterval = (
    layer: Layer,
    interval: Interval
): LayerTimeConfigEntry | undefined => {
    if (!interval?.isValid || !layer.timeConfig?.timeEntries?.length) {
        return
    }
    return layer.timeConfig.timeEntries.find((entry) => {
        if (entry.interval) {
            return entry.interval.overlaps(interval)
        }
        return false
    })
}
