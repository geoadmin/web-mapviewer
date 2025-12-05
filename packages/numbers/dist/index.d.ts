/**
 * Compute the circular mean of radians angles
 *
 * @param values List of radians angles to compute the circular mean
 * @returns Circular mean in radians
 * @see https://en.wikipedia.org/wiki/Circular_mean
 */
export declare function circularMean(values: number[]): number | undefined;

/**
 * @param value A floating number
 * @param fromList A list of integer
 * @returns The closest value, from the list of integer, matching the floating number (will floor or
 *   ceil accordingly)
 */
export declare function closest(value: number, fromList: number[]): number;

/**
 * Format this number into a string with the `de-CH` locale (thousands separator is ')
 *
 * @param value The value to be formatted
 * @param decimal How many decimals should be shown
 */
export declare function format(value: number, decimal?: number): string;

/**
 * Returns a string representing a number with the right thousand separator
 *
 * @param num A number, or a string representing a number
 * @param separator The thousand separator, default to "'"
 * @returns String A formatted string representing a number, e.g. 1'546
 */
export declare function formatThousand(num: number | string, separator?: string): string;

export declare interface GeoadminNumberUtils {
    round: typeof round;
    closest: typeof closest;
    isNumber: typeof isNumber;
    randomIntBetween: typeof randomIntBetween;
    format: typeof format;
    formatThousand: typeof formatThousand;
    wrapDegrees: typeof wrapDegrees;
    isTimestampYYYYMMDD: typeof isTimestampYYYYMMDD;
    circularMean: typeof circularMean;
}

/**
 * Returns true if value represents or is a number (a string containing a valid number will return
 * true)
 */
export declare function isNumber(value: unknown): boolean;

/**
 * Test if the given string match a timestamp of the format YYYYMMDD
 *
 * NOTE: it only supports timestamp from 00000101 to 99991231
 *
 * @param timestamp
 * @returns True if it match false otherwise
 */
export declare function isTimestampYYYYMMDD(timestamp: string): boolean;

declare const numbers: GeoadminNumberUtils;
export default numbers;
export { numbers }

/**
 * Returns a random int in the range provided
 *
 * @param start The start of the range
 * @param end The end of the range, must be greater than the start
 * @returns A random number between start and end (both included), or 0 if either start or end is
 *   not a number or start is bigger than the end
 */
export declare function randomIntBetween(start: number, end: number): number;

/** @module geoadmin/numbers */
/**
 * Rounds the given value according to how many decimals are wanted
 *
 * @param value
 * @param decimals How many decimals after the separator must be present after rounding (default to
 *   0)
 * @returns Value rounded
 */
export declare function round(value: number, decimals?: number): number;

/**
 * Makes sure that the given angle stays between -359.99999 and 359.9999 degrees (will start over at
 * 0 whenever a full-circle is present)
 */
export declare function wrapDegrees(angleInDegrees: number): number;

export { }
