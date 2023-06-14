/**
 * Year we are using to describe the timestamp "all data" for WMS (and also for WMTS as there is no
 * equivalent for that in the norm)
 *
 * For WMTS : as we want this year to be passed along year by year we can't use the actual year
 * (today would be 2023) as otherwise this link opened in 2024 won't show "current" data but 2023
 * data, so we store it the same way WMS does, with 9999 as a year
 *
 * @type {number}
 */
export const YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA = 9999
/**
 * Timestamp to describe "all data" for time enabled WMS layer
 *
 * @type {string}
 */
export const ALL_YEARS_WMS_TIMESTAMP = 'all'
/**
 * Timestamp to describe "current" or latest available data for a time enabled WMTS layer (and also
 * is the default value to give any WMTS layer that is not time enabled, as this timestamp is
 * required in the URL scheme)
 *
 * @type {string}
 */
export const CURRENT_YEAR_WMTS_TIMESTAMP = 'current'

export default class LayerTimeConfigEntry {
    /** @param {String} timestamp A full timestamp as YYYYYMMDD */
    constructor(timestamp) {
        this.timestamp = timestamp
        if (
            this.timestamp === ALL_YEARS_WMS_TIMESTAMP ||
            this.timestamp === CURRENT_YEAR_WMTS_TIMESTAMP
        ) {
            this.year = YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA
        } else {
            this.year = parseInt(timestamp.substring(0, 4))
        }
    }
}
