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
