import log from '@geoadmin/log'
import axios from 'axios'

import { getViewerDedicatedServicesBaseUrl } from '@/config/baseUrl.config'

/**
 * Generates a URL to generate a QR Code for a URL
 *
 * @param {String} url The URL we want to QR-Codify
 * @returns {String} The URL to generate the QR Code
 */
export function getGenerateQRCodeUrl(url) {
    const encodedUrl = encodeURIComponent(url)
    return `${getViewerDedicatedServicesBaseUrl()}qrcode/generate?url=${encodedUrl}`
}

/**
 * Generates a QR Code that, when scanned by mobile devices, open the URL given in parameters
 *
 * @param {String} url The URL we want to QR-Codify
 * @returns {Promise<Byte>} A promise that will resolve with the image (QR-Code) in PNG format
 *   (byte)
 */
export const generateQrCode = (url) => {
    return new Promise((resolve, reject) => {
        try {
            new URL(url)
        } catch (error) {
            const errorMessage = 'Invalid URL, no QR code generated'
            log.error(errorMessage, url, error)
            reject(errorMessage)
        }
        axios
            .get(getGenerateQRCodeUrl(url), {
                responseType: 'arraybuffer',
            })
            .then((image) => {
                resolve(
                    'data:image/png;base64,'.concat(
                        btoa(String.fromCharCode(...new Uint8Array(image.data)))
                    )
                )
            })
            .catch((error) => {
                log.error('Error while retrieving qrCode for', url, error)
                reject(error)
            })
    })
}
