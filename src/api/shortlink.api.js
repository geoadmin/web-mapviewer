import { API_SERVICE_SHORTLINK_BASE_URL } from '@/config'
import log from '@/utils/logging'
import axios from 'axios'

/**
 * Generates a short link from the given URL
 *
 * @param {String} url The URL we want to shorten
 * @returns {Promise<String>} A promise that will resolve with the short link
 */
export function createShortLink(url) {
    return new Promise((resolve, reject) => {
        try {
            new URL(url)
        } catch (e) {
            const errorMessage = 'Invalid URL, no short link generated'
            log.error(errorMessage, url)
            reject(errorMessage)
        }
        axios
            .post(API_SERVICE_SHORTLINK_BASE_URL, {
                url: url,
            })
            .then((response) => {
                resolve(response.data.shorturl)
            })
            .catch((error) => {
                log.error('Error while retrieving short link for', url, error)
                reject(error)
            })
    })
}
