import type { Staging } from '@swissgeo/staging-config'

import log from '@swissgeo/log'
import { getViewerDedicatedServicesBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

import LogColorPerService from '@/config/log'

const logConfig = {
    title: 'QRCode API',
    titleColor: LogColorPerService.qrCode,
}

/** Generates a URL to generate a QR Code for a URL */
function generateQRCodeUrl(url: string, staging: Staging = 'production'): string {
    const encodedUrl = encodeURIComponent(url)
    return `${getViewerDedicatedServicesBaseUrl(staging)}qrcode/generate?url=${encodedUrl}`
}

/**
 * Generates a QR Code that, when scanned by mobile devices, open the URL given in parameters
 *
 * @param url The URL we want to QR-Codify
 * @param [staging] On which backend to run the request
 * @returns A promise that will resolve with the image (QR-Code) in PNG format (byte)
 */
const generateQrCodeImage = (url: string, staging: Staging = 'production'): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            new URL(url)
        } catch (error) {
            const errorMessage = 'Invalid URL, no QR code generated'
            log.error({
                ...logConfig,
                messages: [errorMessage, url, error],
            })
            reject(new Error(errorMessage))
        }
        axios
            .get(generateQRCodeUrl(url, staging), {
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
                log.error({
                    ...logConfig,
                    messages: ['Error while retrieving qrCode for', url, error],
                })
                reject(new Error(error))
            })
    })
}

export const qrcodeAPI = {
    getGenerateQRCodeUrl: generateQRCodeUrl,
    generateQrCode: generateQrCodeImage,
}
export default qrcodeAPI
