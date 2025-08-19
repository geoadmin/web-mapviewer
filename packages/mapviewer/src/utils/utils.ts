import log from '@geoadmin/log'

/** Check if the provided string is a valid URL */
export function isValidUrl(urlToCheck: string): boolean {
    let url

    try {
        url = new URL(urlToCheck)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}

/**
 * Escape all RegExp special character from string
 *
 * @returns New string with all special RegExp character escaped
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface SegmentizedText {
    text: string
    match: boolean
}

/**
 * Segmentation of a text based on a search string
 *
 * @param text Text to segmentize
 * @param search String to search in text for segmentation
 * @returns Segmentized text
 */
export function segmentizeMatch(text: string, search: RegExp | string): SegmentizedText[] {
    if (!search) {
        return [{ text: text, match: false }]
    }

    let regex = null
    if (search instanceof RegExp) {
        regex = new RegExp(`(${search.source})`, search.flags)
    } else {
        regex = new RegExp(`(${escapeRegExp(search)})`, 'gi')
    }

    return text.split(regex).map((segment) => {
        if (
            (search instanceof RegExp && regex.test(segment)) ||
            (!(search instanceof RegExp) && segment.toLowerCase() === search.toLowerCase())
        ) {
            // Matching part
            return { text: segment, match: true }
        } else {
            // Non-matching part
            return { text: segment, match: false }
        }
    })
}

/**
 * Using Date's toISOString outputs an ISO8601 timestamp that is UTC only.
 *
 * This function uses the local time and export is as ISO8601
 */
function getLocalIso8601(): string {
    const now = new Date()

    const year = now.getFullYear()
    const month = `${now.getMonth() + 1}`.padStart(2, '0')
    const day = `${now.getDate()}`.padStart(2, '0')
    const hour = `${now.getHours()}`.padStart(2, '0')
    const minute = `${now.getMinutes()}`.padStart(2, '0')
    const second = `${now.getSeconds()}`.padStart(2, '0')

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

/** Generate file name for exports */
export function generateFilename(fileExtension: string): string {
    const fileExtensionWithoutDot = fileExtension.replace(/^\./, '')
    const timeWithoutColumns = getLocalIso8601().replace(/:/g, '_')
    return `map.geo.admin.ch_${fileExtensionWithoutDot.toUpperCase()}_${timeWithoutColumns}.${fileExtensionWithoutDot.toLowerCase()}`
}

/**
 * Parse a URL hash fragment
 *
 * We use query in the hash fragment, the standard new URL doesn't parse the query from the hash,
 * this function does and return the URL object with the hash fragment without query and the the
 * query separated.
 */
export function parseUrlHashQuery(url: string): { urlObj: URL; hash: string; query: string } {
    const urlObj = new URL(url)
    // extract query from hash
    let queryIndex = urlObj.hash.indexOf('?')
    queryIndex = queryIndex >= 0 ? queryIndex : urlObj.hash.length
    const hash = urlObj.hash.substring(0, queryIndex)
    const query = urlObj.hash.substring(queryIndex)
    return {
        urlObj,
        hash,
        query,
    }
}

/**
 * Transform a /#/map url to /#/embed url
 *
 * If the URL is not a SCHEME://DOMAIN/#/map then it is returned unchanged.
 *
 * @param url Url to transform on /#/embed
 * @returns Url transformed to /#/embed
 */
export function transformUrlMapToEmbed(url: string): string {
    const { urlObj, hash, query } = parseUrlHashQuery(url)
    log.debug(`Transform url from map to embed hash=${hash}`, urlObj)
    if (hash === '#/map') {
        urlObj.hash = `#/embed${query}`
    }
    return urlObj.toString()
}

/**
 * Inserts a parameter into the URL hash
 *
 * @param url Url to transform
 * @param paramName Name of the parameter to insert
 * @param paramValue Value of the parameter to insert
 * @returns Transformed URL
 */
export function insertParameterIntoUrl(url: string, paramName: string, paramValue: string): string {
    const { urlObj, hash, query } = parseUrlHashQuery(url)

    const params = new URLSearchParams(query)
    params.set(paramName, paramValue)

    const basePath = hash.split('?')[0]
    const newQuery = decodeURIComponent(params.toString())

    urlObj.hash = `${basePath}?${newQuery}`

    return urlObj.toString()
}

/** Removes a parameter from the URL hash */
export function removeParameterFromUrl(url: string, paramName: string): string {
    const { urlObj, hash, query } = parseUrlHashQuery(url)

    const params = new URLSearchParams(query)
    params.delete(paramName)

    const basePath = hash.split('?')[0]
    const newQuery = decodeURIComponent(params.toString())

    // if the query is empty, we remove it from the hash
    urlObj.hash = newQuery ? `${basePath}?${newQuery}` : basePath

    return urlObj.toString()
}

/**
 * Check if the provided string is a valid email address
 *
 * @param email Email address to check
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
    // comes from https://v2.vuejs.org/v2/cookbook/form-validation.html#Using-Custom-Validation
    const EMAIL_REGEX =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return EMAIL_REGEX.test(email)
}

/**
 * Human-readable size
 *
 * @param size Size in bytes
 * @returns Human readable size
 */
export function humanFileSize(size: number): string {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

/**
 * Get the longest common prefix in an array of URLs.
 *
 * This function finds the longest common prefix shared by all URLs in the array. The resulting
 * prefix will always end with a `/` if it exists.
 *
 * @param urls An array of URLs to find the common prefix for.
 * @returns The longest common prefix of the URLs. Returns an empty string if no common prefix
 *   exists.
 */
export function getLongestCommonPrefix(urls: string[]): string {
    if (!urls.length) {
        return ''
    }
    if (urls.length === 1) {
        return urls[0]
    }
    let prefix = urls[0]
    for (const url of urls) {
        while (!url.startsWith(prefix)) {
            prefix = prefix.slice(0, -1)
            if (!prefix) {
                break
            }
        }
    }

    // If the prefix is already in the list of URLs, return it
    // This assumes that the structure of the URLs is consistent
    if (urls.includes(prefix)) {
        return prefix
    }

    // Ensure the prefix is cut at a slash (not in the middle of text)
    if (!prefix.endsWith('/')) {
        const lastSlashIndex = prefix.lastIndexOf('/')
        if (lastSlashIndex !== -1) {
            prefix = prefix.slice(0, lastSlashIndex + 1)
        }
    }

    // Ensure the prefix is at least the base URL
    const baseUrl = new URL(urls[0]).origin + '/'
    if (!prefix.startsWith(baseUrl)) {
        return ''
    }

    return prefix
}

export function downloadFile(urlOrBlob: string | Blob, filename: string): void {
    const a = document.createElement('a')

    let downloadUrl
    if (typeof urlOrBlob === 'string') {
        downloadUrl = urlOrBlob
    } else {
        downloadUrl = window.URL.createObjectURL(urlOrBlob)
    }

    a.href = downloadUrl
    a.download = filename
    a.click()

    a.remove()
    if (typeof urlOrBlob !== 'string') {
        window.URL.revokeObjectURL(downloadUrl)
    }
}
