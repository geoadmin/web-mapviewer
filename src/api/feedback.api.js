import axios from 'axios'

import { getKmlFromUrl } from '@/api/files.api'
import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'
import { APP_VERSION } from '@/config/staging.config'
import log from '@/utils/logging'

/** Maximum size allowed by the backend, can be used to do validation up front */
export const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024
export const KML_MAX_SIZE = 2 * 1024 * 1024

/**
 * @param {String} subject Mandatory
 * @param {String} text Mandatory
 * @param {String | null} [options.kmlFileUrl=null] Default is `null`
 * @param {String | null} [options.kml=null] Default is `null`
 * @param {String | null} [options.email=null] Default is `null`
 * @param {File | null} [options.attachment=null] Default is `null`
 * @returns {Promise<Boolean>} True if successful, false otherwise
 */
export default async function sendFeedback(subject, text, options) {
    const { kmlFileUrl = null, kml = null, email = null, attachment = null } = options

    try {
        let kmlData = null
        if (kmlFileUrl) {
            try {
                kmlData = await getKmlFromUrl(kmlFileUrl)
            } catch (err) {
                log.error(
                    'could not load KML from URL',
                    kmlFileUrl,
                    'will not send KML with feedback',
                    err
                )
            }
        } else {
            kmlData = kml
        }

        const data = {
            subject,
            feedback: text,
            version: APP_VERSION,
            ua: navigator.userAgent,
            permalink: window.location.href,
            kml: kmlData,
            email,
            attachment,
        }
        log.debug('sending feedback with', data)
        const response = await axios.post(`${getViewerDedicatedServicesBaseUrl()}feedback`, data, {
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
