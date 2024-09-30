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

export function unProxifyUrl(proxifiedUrl) {
    if (
        (typeof proxified_url === 'string' || proxifiedUrl instanceof String) &&
        proxifiedUrl.startsWith(getServiceProxyBaseUrl())
    ) {
        let url = proxifiedUrl.replace(getServiceProxyBaseUrl(), '')
        return `${url.split('/')[0]}://${decodeURIComponent(url.split('/')[1])}`
    }

    return proxifiedUrl
}
