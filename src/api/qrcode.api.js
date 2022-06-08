import axios from 'axios'
import log from '@/utils/logging'
import { API_SERVICES_BASE_URL } from '@/config'

/**
 * Generates a QR Code that, when scanned by mobile devices, open the URL given in parameters
 *
 * @param {String} url The URL we want to QR-Codify
 * @returns {Promise<Byte>} A promise that will resolve with the image (QR-Code) in PNG format (byte)
 */
export const generateQrCode = (url) => {
    return new Promise((resolve, reject) => {
        try {
            new URL(url)
        } catch (e) {
            const errorMessage = 'Invalid URL, no QR code generated'
            log.error(errorMessage, url)
            reject(errorMessage)
        }
        axios
            .get(`${API_SERVICES_BASE_URL}qrcode/generate`, {
                params: {
                    url: url,
                },
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
