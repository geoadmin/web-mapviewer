import log from '@swissgeo/log'
import { getViewerDedicatedServicesBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

import type { FeedbackOptions } from '@/types'

import LogColorPerService from '@/config/log'
import filesAPI from '@/files'

/** The maximum size (in bytes) allowed by the backend service. Can be used to do validation up front */
export const ATTACHMENT_MAX_SIZE: number = 10 * 1024 * 1024
export const KML_MAX_SIZE: number = 2 * 1024 * 1024

const logTitle = { title: 'Feedback API', titleColor: LogColorPerService.feedback }

/** @returns True if successful, false otherwise */
export async function sendFeedback(
    subject: string,
    text: string,
    options: FeedbackOptions
): Promise<boolean> {
    const { appVersion, category, kmlFileUrl, kml, email, attachment } = options

    try {
        let kmlData: string | undefined
        if (kmlFileUrl) {
            try {
                kmlData = await filesAPI.getKmlFromUrl(kmlFileUrl)
            } catch (err) {
                log.error({
                    ...logTitle,
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
            version: appVersion ?? 'unknown version',
            ua: navigator.userAgent,
            permalink: window.location.href,
            kml: kmlData,
            email,
            attachment,
        }
        log.debug({
            ...logTitle,
            messages: ['sending feedback with', data],
        })
        const response = await axios.post(`${getViewerDedicatedServicesBaseUrl()}feedback`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        const success = response?.data?.success
        if (success) {
            log.info({
                ...logTitle,
                messages: ['Feedback sent successfully'],
            })
        } else {
            log.error({
                ...logTitle,
                messages: ['Something went wrong while processing this feedback', response],
            })
        }
        return success
    } catch (err) {
        log.error({
            ...logTitle,
            messages: ['Error while sending feedback', err],
        })
        return false
    }
}

export const feedbackAPI = {
    ATTACHMENT_MAX_SIZE,
    KML_MAX_SIZE,
    sendFeedback,
}
export default feedbackAPI
