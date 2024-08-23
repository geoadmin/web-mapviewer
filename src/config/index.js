/**
 * Adds a slash at the end of the URL if there is none
 *
 * @param {String} url
 * @returns {String} The URL with a trailing slash
 */
export function enforceEndingSlashInUrl(url) {
    if (url && !url.endsWith('/')) {
        return `${url}/`
    }
    return url
}
