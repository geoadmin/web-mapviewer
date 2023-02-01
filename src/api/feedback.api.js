import { getKmlFromUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import { API_SERVICES_BASE_URL, APP_VERSION } from '@/config'
import log from '@/utils/logging'
import axios from 'axios'

/**
 * @param {String} text mandatory
 * @param {Number} rating optional
 * @param {Number} maxRating optional
 * @param {String} kmlFileUrl optional
 * @returns {Promise<Boolean>} True if successful, false otherwise
 */
export default async function sendFeedback(
    text,
    rating = null,
    maxRating = null,
    kmlFileUrl = null
) {
    try {
        let shortLink = null
        try {
            shortLink = await createShortLink(window.location.href)
        } catch (err) {
            log.error('could not generate a short link, will not send it with feedback', err)
        }

        let kml = null
        if (kmlFileUrl) {
            try {
                kml = await getKmlFromUrl(kmlFileUrl)
            } catch (err) {
                log.error(
                    'could not load KML from URL',
                    kmlFileUrl,
                    'will not send KML with feedback',
                    err
                )
            }
        }

        let subject = '[web-mapviewer]'
        if (rating && maxRating) {
            subject += ` [rating: ${rating}/${maxRating}]`
        }
        subject += ' User feedback'

        const data = {
            subject,
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
            log.error('Something went wrong while processing this feedback', response)
        }
        return success
    } catch (err) {
        log.error('Error while sending feedback', err)
        return false
    }
}
