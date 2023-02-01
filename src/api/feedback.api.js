import { getKmlFromUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import { API_SERVICES_BASE_URL, APP_VERSION } from '@/config'
import log from '@/utils/logging'
import axios from 'axios'

/**
 * @param {Number} rating
 * @param {Number} maxRating
 * @param {String} text
 * @param {String} kmlFileUrl
 * @returns {Promise<Boolean>} True if successful, false otherwise
 */
export default async function sendFeedback(rating, maxRating, text, kmlFileUrl) {
    try {
        const shortLink = await createShortLink(window.location.href)
        let kml = null
        if (kmlFileUrl) {
            kml = await getKmlFromUrl(kmlFileUrl)
        }
        const data = {
            subject: `[web-mapviewer] [rating: ${rating}/${maxRating}] User feedback`,
            feedback: text,
            version: APP_VERSION,
            ua: navigator.userAgent,
            permalink: shortLink,
            kml,
        }
        log.debug('sending feedback with', data)
        const response = await axios.post(`${API_SERVICES_BASE_URL}feedback`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        const success = response?.data?.success
        if (success) {
            log.info('Feedback sent successfully')
        } else {
            log.error('Something went wrong while processing this feedback')
        }
        return success
    } catch (err) {
        log.error('Error while sending feedback', err)
    }
}
