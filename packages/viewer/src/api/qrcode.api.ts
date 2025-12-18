import log, { LogPreDefinedColor } from '@swissgeo/log'
import { getViewerDedicatedServicesBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

/**
 * Generates a URL to generate a QR Code for a URL
 *
 * @param url The URL we want to QR-Codify
 * @returns The URL to generate the QR Code
 */
export function getGenerateQRCodeUrl(url: string): string {
    const encodedUrl = encodeURIComponent(url)
    return `${getViewerDedicatedServicesBaseUrl()}qrcode/generate?url=${encodedUrl}`
}

/**
 * Generates a QR Code that, when scanned by mobile devices, open the URL given in parameters
 *
 * @param url The URL we want to QR-Codify
 * @returns A promise that will resolve with the image (QR-Code) in PNG format (byte)
 */
export const generateQrCode = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            new URL(url)
        } catch (error) {
            const errorMessage = 'Invalid URL, no QR code generated'
            log.error({
                title: 'QRCode API',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Zinc,
                },
                messages: [errorMessage, url, error],
            })
            reject(new Error(errorMessage))
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
                log.error({
                    title: 'QRCode API',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Zinc,
                    },
                    messages: ['Error while retrieving qrCode for', url, error],
                })
                reject(new Error(error))
            })
    })
}
