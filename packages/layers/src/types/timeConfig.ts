import { Interval } from 'luxon'

/**
 * Year we are using to describe the timestamp "all data" for WMS (and also for WMTS as there is no
 * equivalent for that in the norm)
 *
 * For WMTS : as we want this year to be passed along year by year, we can't use the actual year
 * (today would be 2025) as otherwise this link opened in 2030 won't show "current" data but 2025
 * data, so we store it the same way WMS does, with 9999 as a year
 */
export const YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA: number = 9999

/** Timestamp to describe "all data" for time enabled WMS layer */
export const ALL_YEARS_TIMESTAMP: string = 'all'
/**
 * Timestamp to describe "current" or latest available data for a time enabled WMTS layer (and also
 * is the default value to give any WMTS layer that is not time enabled, as this timestamp is
 * required in the URL scheme)
 */
export const CURRENT_YEAR_TIMESTAMP: string = 'current'

/**
 * Duration of time for when to show data on this layer. Can be a set of instant (expressed as an
 * Interval) or two preset values :
 *
 * - "all": show all available data, across all time entries
 * - "current": show "current" data, which stays "current" when new data is added (loads the new data)
 */
export type LayerTimeInterval = Interval | 'all' | 'current'

export interface LayerTimeConfig {
    timeEntries: LayerTimeConfigEntry[]
    /**
     * Describe which time entry should be used as default value if no value is previously defined
     * when loading the layer.
     *
     * - 'last': will use the top entry from the entry list (the last => the most recent, not the last
     *   of the list)
     * - 'all': will stay as "all", as this describes some kind of hack on the backend to show a fake
     *   year that includes all data (there's not yet support for a real "give me all data" time
     *   entry there)
     * - "current": stays as "current", alias value to tell the backend to show the latest available
     *   value, without having to change the URL each year for our users. ("current" will always
     *   display the latest available data when asked on the backend)
     * - Any number value: specific value, that will be set as is.
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    behaviour?: 'last' | 'all' | 'current' | number | string
    currentTimeEntry?: LayerTimeConfigEntry
}

export interface LayerTimeConfigEntry {
    /**
     * The timestamp used by our backend service to describe this entry (should be used in the URL
     * when requesting tiles/images)
     */
    timestamp: string
    nonTimeBasedValue?: string
    interval?: Interval
    year?: number
}
