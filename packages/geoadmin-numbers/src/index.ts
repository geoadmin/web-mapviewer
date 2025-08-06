/** @module geoadmin/numbers */

/**
 * Rounds the given value according to how many decimals are wanted
 *
 * @param value
 * @param decimals How many decimals after the separator must be present after rounding (default to
 *   0)
 * @returns Value rounded
 */
export function round(value: number, decimals: number = 0): number {
    if (!isNumber(value)) {
        return Number.NaN
    }
    if (decimals === 0) {
        return Math.round(value)
    }
    const pow = Math.pow(10, decimals)
    return Math.round(value * pow) / pow
}

/**
 * @param value A floating number
 * @param fromList A list of integer
 * @returns The closest value, from the list of integer, matching the floating number (will floor or
 *   ceil accordingly)
 */
export function closest(value: number, fromList: number[]): number {
    if (Array.isArray(fromList) && fromList.length > 2) {
        const difference = fromList.map((listValue) => Math.abs(value - listValue))
        const smallestDifference = difference.reduce((diff1, diff2) =>
            diff1 > diff2 ? diff2 : diff1
        )
        return fromList[difference.indexOf(smallestDifference)]
    }
    return value
}

/**
 * Returns true if value represents or is a number (a string containing a valid number will return
 * true)
 */
export function isNumber(value: any): boolean {
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
 *   not a number or start is bigger than the end
 */
export function randomIntBetween(start: number, end: number): number {
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
        return 0
    }
    return Math.floor(Math.random() * (end - start + 1) + start)
}

// grabbed from https://github.com/geoadmin/mf-geoadmin3/blob/5e10a0d224eba9335070eceb25de8d4cc4eb0579/src/components/measure/MeasureService.js#L18-L25
const thousandSeparatorRegex: RegExp = /\B(?=(\d{3})+(?!\d))/g
/**
 * Format this number into a string with the `de-CH` locale (thousands separator is ')
 *
 * @param value The value to be formatted
 * @param decimal How many decimals should be shown
 */
export function format(value: number, decimal: number = 2): string {
    if (!isNumber(value)) {
        return ''
    }
    return `${round(value, decimal)}`.replace(thousandSeparatorRegex, "'")
}

/**
 * Returns a string representing a number with the right thousand separator
 *
 * @param num A number, or a string representing a number
 * @param separator The thousand separator, default to "'"
 * @returns String A formatted string representing a number, e.g. 1'546
 */
export function formatThousand(num: number | string, separator: string = "'"): string {
    const decimalSeparator = '.'
    const parts = `${num}`.split(decimalSeparator)
    parts[0] = parts[0].replace(thousandSeparatorRegex, separator)
    return parts.join(decimalSeparator)
}

/**
 * Makes sure that the given angle stays between -359.99999 and 359.9999 degrees (will start over at
 * 0 whenever a full-circle is present)
 */
export function wrapDegrees(angleInDegrees: number): number {
    const sign = Math.sign(angleInDegrees)
    const absoluteAngle = Math.abs(angleInDegrees)
    if (absoluteAngle > 360) {
        return sign * (absoluteAngle % 360)
    }
    if (absoluteAngle === 360) {
        return 0
    }
    return angleInDegrees
}

/**
 * Test if the given string match a timestamp of the format YYYYMMDD
 *
 * NOTE: it only supports timestamp from 00000101 to 99991231
 *
 * @param timestamp
 * @returns True if it match false otherwise
 */
export function isTimestampYYYYMMDD(timestamp: string): boolean {
    return /^\d{4}(1[0-2]|0[1-9])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(timestamp)
}

/**
 * Compute the circular mean of radians angles
 *
 * @param values List of radians angles to compute the circular mean
 * @returns Circular mean in radians
 * @see https://en.wikipedia.org/wiki/Circular_mean
 */
export function circularMean(values: number[]): number | undefined {
    if (!Array.isArray(values) || values.some((value) => !isNumber(value))) {
        return
    }
    const sumCos = values.reduce((acc, curr) => acc + Math.cos(curr), 0)
    const sumSin = values.reduce((acc, curr) => acc + Math.sin(curr), 0)

    let mean = Math.atan2(sumSin, sumCos)
    // The circular mean with this formula gives a result between -180° and 180°
    // So we need to correct the negative values to have only 0° - 360°
    if (mean < 0) {
        // Correction formula in degree would be := 2 * 180 + mean but because we use radians
        // we need to convert 180° to radian => Math.PI => Math.PI * 2 = 6.2831853
        mean = 6.2831853 + mean
    }
    return mean
}

export interface GeoadminNumberUtils {
    round: typeof round
    closest: typeof closest
    isNumber: typeof isNumber
    randomIntBetween: typeof randomIntBetween
    format: typeof format
    formatThousand: typeof formatThousand
    wrapDegrees: typeof wrapDegrees
    isTimestampYYYYMMDD: typeof isTimestampYYYYMMDD
    circularMean: typeof circularMean
}

const numbers: GeoadminNumberUtils = {
    round,
    closest,
    isNumber,
    randomIntBetween,
    format,
    formatThousand,
    wrapDegrees,
    isTimestampYYYYMMDD,
    circularMean,
}
export { numbers }
export default numbers
