/**
 * Rounds the given value according to how many decimals are wanted
 * @param {number} value
 * @param {number} decimals how many decimals after the separator must be present after rounding (default to 0)
 * @returns {number} value rounded
 */
export function round(value, decimals=0) {
    if (!isNumber(value)) {
        return undefined;
    }
    if (decimals === 0) {
        return Math.round(value);
    }
    const pow = Math.pow(10, decimals);
    return Math.round(value * pow) / pow;
}

/**
 * Returns true if value represents or is a number (a string containing a valid number will return true)
 * @param {any} value
 * @returns {boolean}
 */
export function isNumber(value) {
    return value !== null
        && value !== undefined
        && !Number.isNaN(Number(value))
        && (typeof value !== 'string' || value.length !== 0);
}

/**
 * Returns a random int in the range provided
 * @param start the start of the range
 * @param end the end of the range, must be greater than the start
 * @returns a random number between start and end (both included), or 0 if either start or end is not a number or start is bigger than end
 */
export function randomIntBetween(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
        return 0;
    }
    return Math.floor(Math.random() * end) + start;
}
