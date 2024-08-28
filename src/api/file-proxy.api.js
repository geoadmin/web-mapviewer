import axios from 'axios'
import { isString } from 'lodash'

import { getServiceProxyBaseUrl } from '@/config/baseUrl.config'
import log from '@/utils/logging'

/**
 * Transform a Dropbox URL to a direct download link, replacing dl=0 by dl=1
 *
 * @param {String} fileUrl
 * @returns {String} The transformed URL
 * @see https://www.dropbox.com/help/desktop-web/force-download
 */
function transformDropboxUrl(fileUrl) {
    const dropboxPattern = /^(https?:\/\/(www\.)?dropbox\.com\/.+)/
    if (dropboxPattern.test(fileUrl)) {
        try {
            const url = new URL(fileUrl)
            const params = new URLSearchParams(url.search)
            if (params.get('dl') === '0') {
                params.set('dl', '1')
                url.search = params.toString()
                return url.toString()
            }
        } catch (e) {
            log.debug('failed to transformDropboxUrl', e)
            return fileUrl
        }
    }
    return fileUrl
}

/**
 * Transform our file URL into a path, compatible with a call to service-proxy
 *
 * @param {String} fileUrl
 * @see https://github.com/geoadmin/service-proxy?tab=readme-ov-file#using-the-proxy
 */
export function transformFileUrl(fileUrl) {
    if (!isString(fileUrl)) {
        return null
    }
    // copy from https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/UrlUtilsService.js#L59-L69
    const parts = /^(http|https)(:\/\/)(.+)/.exec(transformDropboxUrl(fileUrl))
    if (parts?.length < 4) {
        return null
    }
    const protocol = parts[1]
    const resource = parts[3]
    return `${protocol}/${encodeURIComponent(resource)}`
}

export function proxifyUrl(url) {
    const fileAsPath = transformFileUrl(url)
    if (!fileAsPath) {
        throw new Error(`Malformed URL: ${url}, can't proxify`)
    }
    return `${getServiceProxyBaseUrl()}${fileAsPath}`
}

/**
 * Get a file through our service-proxy backend, taking care of CORS headers in the process.
 *
 * That means that a file for which there is no defined CORS header will still be accessible through
 * this function (i.e. Dropbox/name your cloud share links)
 *
 * @param {String} fileUrl
 * @param {Object} [options]
 * @param {Number} [options.timeout] How long should the call wait before timing out
 * @returns {Promise<AxiosResponse>} A promise which resolve to the proxy response
 */
export default function getFileThroughProxy(fileUrl, options = {}) {
    const { timeout = null } = options
    return new Promise((resolve, reject) => {
        try {
            axios({
                method: 'get',
                url: proxifyUrl(fileUrl),
                timeout,
            })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    log.error(
                        'Error while accessing file URL through service-proxy',
                        fileUrl,
                        error
                    )
                    reject(error)
                })
        } catch (error) {
            reject(error)
        }
    })
}
