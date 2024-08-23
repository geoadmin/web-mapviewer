import axios from 'axios'

import { getServiceShortLinkBaseUrl } from '@/config/baseUrl.config'
import log from '@/utils/logging'

/**
 * Generates a short link from the given URL
 *
 * @param {String} url The URL we want to shorten
 * @param {Boolean} withCrosshair If a cross-hair should be placed at the center of the map in the
 *   shortlink
 * @returns {Promise<String>} A promise that will resolve with the short link
 */
export function createShortLink(url, withCrosshair = false) {
    return new Promise((resolve, reject) => {
        // we do not want the geolocation of the user clicking the link to kick in, so we force the flag out of the URL
        let sanitizedUrl = url.replace('&geolocation', '')
        if (withCrosshair) {
            sanitizedUrl += '&crosshair=marker'
        }
        try {
            new URL(sanitizedUrl)
        } catch (e) {
            const errorMessage = 'Invalid URL, no short link generated'
            log.error(errorMessage, sanitizedUrl)
            reject(errorMessage)
        }
        axios
            .post(getServiceShortLinkBaseUrl(), {
                url: sanitizedUrl,
            })
            .then((response) => {
                resolve(response.data.shorturl)
            })
            .catch((error) => {
                log.error('Error while retrieving short link for', sanitizedUrl, error)
                reject(error)
            })
    })
}
