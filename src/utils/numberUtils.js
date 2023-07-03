/**
 * Rounds the given value according to how many decimals are wanted
 *
 * @param {number} value
 * @param {number} decimals How many decimals after the separator must be present after rounding
 *   (default to 0)
 * @param {boolean} enforcedigit if set to true, we want to have that many figures after the period.
 *   Otherwise, we don't care.
 * @returns {number} Value rounded
 */
export function round(value, decimals = 0, enforcedigit = false) {
    if (!isNumber(value)) {
        return undefined
    }
    if (decimals === 0) {
        return Math.round(value)
    }
    if (enforcedigit) {
        return value.toFixed(decimals)
    }
    const pow = Math.pow(10, decimals)
    return Math.round(value * pow) / pow
}

/**
 * Returns true if value represents or is a number (a string containing a valid number will return
 * true)
 *
 * @param {any} value
 * @returns {boolean}
 */
export function isNumber(value) {
    return (
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)) &&
        (typeof value !== 'string' || value.length !== 0)
    )
}

/**
 * Returns a random int in the range provided
 *
 * @param start The start of the range
 * @param end The end of the range, must be greater than the start
 * @returns A random number between start and end (both included), or 0 if either start or end is
 *   not a number or start is bigger than end
 */
export function randomIntBetween(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
        return 0
    }
    return Math.floor(Math.random() * end) + start
}

// grabbed from https://github.com/geoadmin/mf-geoadmin3/blob/5e10a0d224eba9335070eceb25de8d4cc4eb0579/src/components/measure/MeasureService.js#L18-L25
const thousandSeparatorRegex = /\B(?=(\d{3})+(?!\d))/g
/**
 * Format this number into a string with the `de-CH` locale (thousand separator is ')
 *
 * @param {number} value The value to be formatted
 * @param {number} decimal How many decimal should be shown
 */
export function format(value, decimal = 2) {
    if (typeof value !== 'number') {
        return undefined
    }
    return `${round(value, decimal)}`.replace(thousandSeparatorRegex, "'")
}

/**
 * Returns a string representing a number with the right thousand seaprator
 *
 * @param num A number
 * @param separator The thousand separator, default to "'"
 * @returns A formatted string representing a number, e.g. 1'546
 */

export function formatThousand(num, separator = "'") {
    const decimalSeparator = '.'
    var parts = num.toString().split(decimalSeparator)
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join(decimalSeparator)
}
