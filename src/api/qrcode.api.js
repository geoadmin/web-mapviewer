import axios from 'axios'
import log from '@/utils/logging'
import { API_SERVICE_QRCODE_BASE_URL } from '@/config'

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
            log('error', errorMessage, url)
            reject(errorMessage)
        }
        axios
            .post(`${API_SERVICE_QRCODE_BASE_URL}/qrcode/generate`, {
                body: {
                    url: url,
                },
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
            })
            .then((image) => {
                resolve(image)
            })
            .catch((error) => {
                log('error', 'Error while retrieving qrCode for', url, error)
                reject(error)
            })
    })
}
