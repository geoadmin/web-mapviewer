import axios from 'axios'

import { getKmlFromUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import { API_SERVICES_BASE_URL, APP_VERSION } from '@/config'
import log from '@/utils/logging'

/**
 * @param {String} subject Mandatory
 * @param {String} text Mandatory
 * @param {String | null} [options.kmlFileUrl=null] Default is `null`
 * @param {String | null} [options.email=null] Default is `null`
 * @param {File | null} [options.attachment=null] Default is `null`
 * @returns {Promise<Boolean>} True if successful, false otherwise
 */
export default async function sendFeedback(subject, text, options) {
    const { kmlFileUrl = null, email = null, attachment = null } = options

    try {
        let shortLink = null
        try {
            shortLink = await createShortLink(window.location.href)
        } catch (err) {
            log.error(
                'could not generate a short link, will send the full URL to service feedback',
                err
            )
            // fallback to full URL
            shortLink = window.location.href
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

        const data = {
            subject,
            feedback: text,
            version: APP_VERSION,
            ua: navigator.userAgent,
            permalink: shortLink,
            kml,
            email,
            attachment,
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
