import axios from 'axios'
import { isString } from 'lodash'

import { API_SERVICE_PROXY_BASE_URL } from '@/config'
import log from '@/utils/logging'

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
    const parts = /^(http|https)(:\/\/)(.+)/.exec(fileUrl)
    const protocol = parts[1]
    const resource = parts[3]
    return `${protocol}/${encodeURIComponent(resource)}`
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
        const fileAsPath = transformFileUrl(fileUrl)
        if (!fileAsPath) {
            reject(new Error(`Malformed file URL: ${fileUrl}`))
            return
        }
        axios({
            method: 'get',
            url: `${API_SERVICE_PROXY_BASE_URL}${fileAsPath}`,
            timeout,
        })
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                log.error('Error while accessing file URL through service-proxy', fileUrl, error)
                reject(error)
            })
    })
}
