import type { Staging } from '@swissgeo/staging-config';
import type { CancelTokenSource } from 'axios'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { getServiceShortLinkBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

let cancelToken: CancelTokenSource | undefined
export interface ShortLinkOptions {
    withCrosshair?: boolean
    url: string
    staging: Staging
}
/**
 * Generates a short link from the given URL
 *
 * @param url The URL we want to shorten
 * @param withCrosshair If a cross-hair should be placed at the center of the map in the shortlink
 * @returns A promise that will resolve with the short link
 */
function createShortLink(options: ShortLinkOptions): Promise<string | undefined> {
    const { url, withCrosshair = false, staging } = options
    return new Promise((resolve, reject) => {
        // we do not want the geolocation of the user clicking the link to kick in, so we force the flag out of the URL
        let sanitizedUrl = url.replace('&geolocation', '')
        if (withCrosshair) {
            sanitizedUrl += '&crosshair=marker'
        }
        try {
            new URL(sanitizedUrl)
        } catch (error) {
            const errorMessage = 'Invalid URL, no short link generated'
            log.error({
                title: 'ShortLink API',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Gray,
                },
                messages: [errorMessage, sanitizedUrl, error],
            })
            reject(new Error(errorMessage))
        }

        // if a request is currently pending, we cancel it to start the new one
        if (cancelToken) {
            cancelToken.cancel('A new shortLink request arrived')
        }
        // CancelToken is only a type and can't be imported as a "class" directly. So calling `axios.CancelToken` is required.
        // eslint-disable-next-line import/no-named-as-default-member
        cancelToken = axios.CancelToken.source()

        axios
            .post(getServiceShortLinkBaseUrl(staging), {
                url: sanitizedUrl,
            })
            .then((response) => {
                resolve(response.data.shorturl)
            })
            .catch((error) => {
                log.error({
                    title: 'ShortLink API',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Gray,
                    },
                    messages: ['Error while retrieving short link for', sanitizedUrl, error],
                })
                reject(new Error(error))
            })
            .finally(() => {
                cancelToken = undefined
            })
    })
}

export const shortLinkAPI = {
    createShortLink,
}
export default shortLinkAPI
