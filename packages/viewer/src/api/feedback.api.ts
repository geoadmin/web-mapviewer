import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

import { getKmlFromUrl } from '@/api/files.api'
import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'
import { APP_VERSION } from '@/config/staging.config'

/** Maximum size allowed by the backend, can be used to do validation up front */
export const ATTACHMENT_MAX_SIZE: number = 10 * 1024 * 1024
export const KML_MAX_SIZE: number = 2 * 1024 * 1024

interface FeedbackOptions {
    category?: string
    kmlFileUrl?: string
    kml?: string
    email?: string
    attachment?: File
}

/** @returns True if successful, false otherwise */
export default async function sendFeedback(
    subject: string,
    text: string,
    options: FeedbackOptions
): Promise<boolean> {
    const { category, kmlFileUrl, kml, email, attachment } = options

    try {
        let kmlData: string | undefined
        if (kmlFileUrl) {
            try {
                kmlData = await getKmlFromUrl(kmlFileUrl)
            } catch (err) {
                log.error({
                    title: 'Feedback API',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [
                        'could not load KML from URL',
                        kmlFileUrl,
                        'will not send KML with feedback',
                        err,
                    ],
                })
            }
        } else {
            kmlData = kml
        }

        const data = {
            subject,
            feedback: text,
            category,
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
            log.info({
                title: 'Feedback API',
                titleColor: LogPreDefinedColor.Amber,
                messages: ['Feedback sent successfully'],
            })
        } else {
            log.error({
                title: 'Feedback API',
                titleColor: LogPreDefinedColor.Amber,
                messages: ['Something went wrong while processing this feedback', response],
            })
        }
        return success
    } catch (err) {
        log.error({
            title: 'Feedback API',
            titleColor: LogPreDefinedColor.Amber,
            messages: ['Error while sending feedback', err],
        })
        return false
    }
}
