import log from '@/utils/logging'
import axios from 'axios'
import { API_SERVICES_BASE_URL, APP_VERSION } from '@/config'
import { createShortLink } from '@/api/shortlink.api'
import { getKmlFromUrl } from '@/api/files.api'
export default async function sendFeedback(rating, maxRating, text, kmlFileUrl) {
    try {
        const shortLink = await createShortLink(window.location.href)
        let kml = null
        if (kmlFileUrl) {
            kml = await getKmlFromUrl(kmlFileUrl)
        }
        return await axios.post(
            `${API_SERVICES_BASE_URL}feedback`,
            {
                subject: `[web-mapviewer] [rating: ${rating}/${maxRating}] User feedback`,
                feedback: text,
                version: APP_VERSION,
                ua: navigator.userAgent,
                permalink: shortLink,
                kml,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
    } catch (err) {
        log.error('Error while sending feedback', err)
    }
}
