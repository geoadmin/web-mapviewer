import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'

/**
 * The oldest possible year in our system is from the layer Journey Through Time
 * (ch.swisstopo.zeitreihen) which has data from the year 1844
 *
 * @type {Number}
 */
export const TIME_SLIDER_OLDEST_POSSIBLE_YEAR = 1844

/**
 * The youngest (closest to now) year in our system, it will always be the previous year as of now
 *
 * @type {Number}
 */
export const TIME_SLIDER_YOUNGEST_YEAR = new Date().getFullYear() - 1

/**
 * List of all possible years when our backends might have data
 *
 * @type {Number[]}
 */
export const TIME_SLIDER_ALL_YEARS = (() => {
    const years = []
    for (let year = TIME_SLIDER_OLDEST_POSSIBLE_YEAR; year <= TIME_SLIDER_YOUNGEST_YEAR; year++) {
        years.push(year)
    }
    return years
})()

/**
 * Finds the most recent common year between all given time configs
 *
 * @param {LayerTimeConfig[]} timeConfigs
 * @returns {Number} Most recent common year between all given time configs
 */
export function findMostRecentCommonYear(timeConfigs) {
    if (timeConfigs.length === 0) {
        return null
    }
    if (timeConfigs.length === 1) {
        // if only one time config is given, we give the most recent year as result
        return timeConfigs[0].years.splice(-1)[0]
    }
    let yearsInCommon = [...timeConfigs[0].years]
    timeConfigs.slice(1).forEach((timeConfig) => {
        yearsInCommon = yearsInCommon.filter((year) => timeConfig.years.includes(year))
    })
    return yearsInCommon[0]
}

/**
 * Sort given years so that the first year of the array is the biggest (most recent)
 *
 * @param {Number[]} years
 * @returns {Number[]}
 */
function sortYearsChronologically(years = []) {
    const sortedYears = [...years]
    sortedYears.sort((year1, year2) => year2 - year1)
    return sortedYears
}

/**
 * Returns all common years found between all configs, returned in a chronological order in the
 * output array (first element is the most recent)
 *
 * @param {LayerTimeConfig[]} timeConfigs
 * @returns {Number[]} All common years, or an empty array if no common years were found
 */
export function getCommonYears(timeConfigs) {
    if (
        !Array.isArray(timeConfigs) ||
        timeConfigs.length === 0 ||
        timeConfigs.find((config) => !(config instanceof LayerTimeConfig))
    ) {
        return []
    }
    let commonYears = [...timeConfigs[0].years]
    timeConfigs.forEach((config) => {
        commonYears = commonYears.filter((year) => config.years.includes(year))
    })
    return sortYearsChronologically(commonYears)
}
