/**
 * The default oldest year in our system is from the layer Journey Through Time
 * (ch.swisstopo.zeitreihen) which has data from the year 1844
 */
export const DEFAULT_OLDEST_YEAR: number = 1844

/**
 * The default youngest (closest to now) year in our system, it will always be the previous year as
 * of now
 */
export const DEFAULT_YOUNGEST_YEAR: number = new Date().getFullYear()
