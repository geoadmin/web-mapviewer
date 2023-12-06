/**
 * Check if the provided string is a valid URL
 *
 * @param {string} urlToCheck
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUrl(urlToCheck) {
    let url

    try {
        url = new URL(urlToCheck)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}
