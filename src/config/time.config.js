/**
 * The oldest year in our system is from the layer Journey Through Time (ch.swisstopo.zeitreihen)
 * which has data from the year 1844
 *
 * @type {Number}
 */
export const OLDEST_YEAR = 1844

/**
 * The youngest (closest to now) year in our system, it will always be the previous year as of now
 *
 * @type {Number}
 */
export const YOUNGEST_YEAR = new Date().getFullYear()
