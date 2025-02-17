import { isTimestampYYYYMMDD } from '@geoadmin/numbers'

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
export const ALL_YEARS_TIMESTAMP = 'all'
/**
 * Timestamp to describe "current" or latest available data for a time enabled WMTS layer (and also
 * is the default value to give any WMTS layer that is not time enabled, as this timestamp is
 * required in the URL scheme)
 *
 * @type {string}
 */
export const CURRENT_YEAR_TIMESTAMP = 'current'

/**
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class LayerTimeConfigEntry {
    /** @param {String} timestamp A full timestamp as YYYYYMMDD or ISO 8601 format */
    constructor(timestamp) {
        this.timestamp = timestamp
        if (this.timestamp === ALL_YEARS_TIMESTAMP || this.timestamp === CURRENT_YEAR_TIMESTAMP) {
            // for "all" and "current" timestamps we use it as well as year to be added in the UI selection
            // as well as in the URL year attribute of layers param.
            this.year = this.timestamp
        } else if (this.timestamp.startsWith('9999')) {
            // TODO PB-680 clean up "all" hack
            // Currently the backends (mf-chsdi3 for layerConfig and WMTS) are using a hack to describe "all"
            // by using a timestamp with the year 9999 (we have in my knowledge three type of "all" WMTS timestmaps
            //  1. 9999      (e.g. ch.swisstopo.lubis-terrestrische_aufnahmen)
            //  2. 99990101  (e.g. ch.astra.unfaelle-personenschaeden_alle)
            //  3. 99991231  (e.g. ch.swisstopo.lubis-luftbilder-dritte-firmen)
            this.year = ALL_YEARS_TIMESTAMP
        } else {
            if (isTimestampYYYYMMDD(timestamp)) {
                this.year = parseInt(timestamp.substring(0, 4))
            } else {
                const date = new Date(timestamp)
                if (!isNaN(date)) {
                    this.year = date.getFullYear()
                } else {
                    this.year = null
                }
            }
        }
    }
}
