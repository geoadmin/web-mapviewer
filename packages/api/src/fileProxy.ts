import log from '@swissgeo/log'
import { getServiceProxyBaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'
import { isString } from 'lodash'

import LogColorPerService from '@/config/log'

const dropboxPattern = /^(https?:\/\/(www\.)?dropbox\.com\/.+)/

const logConfig = {
    title: 'File proxy API',
    titleColor: LogColorPerService.fileProxy,
}

/**
 * Transform a Dropbox URL to a direct download link, replacing dl=0 by dl=1
 *
 * @see https://www.dropbox.com/help/desktop-web/force-download
 */
function transformDropboxUrl(fileUrl: string): string {
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
            log.debug({
                ...logConfig,
                messages: ['failed to transformDropboxUrl', e],
            })
            return fileUrl
        }
    }
    return fileUrl
}

/**
 * Transform our file URL into a path, compatible with a call to service-proxy
 *
 * @see https://github.com/geoadmin/service-proxy?tab=readme-ov-file#using-the-proxy
 */
function transformFileUrl(fileUrl: string): string | undefined {
    if (!isString(fileUrl)) {
        return
    }
    // copy from https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/UrlUtilsService.js#L59-L69
    const parts = /^(http|https)(:\/\/)(.+)/.exec(transformDropboxUrl(fileUrl))
    if (!parts || !parts.length || parts.length < 4) {
        return
    }
    const protocol = parts[1]
    const resource = parts[3]
    return `${protocol}/${encodeURIComponent(resource)}`
}

function proxifyUrl(url: string): string {
    const fileAsPath = transformFileUrl(url)
    if (!fileAsPath) {
        throw new Error(`Malformed URL: ${url}, can't proxify`)
    }
    return `${getServiceProxyBaseUrl()}${fileAsPath}`
}

function unProxifyUrl(proxifiedUrl: string): string {
    if (proxifiedUrl.startsWith(getServiceProxyBaseUrl())) {
        const url = proxifiedUrl.replace(getServiceProxyBaseUrl(), '')
        return `${url.split('/')[0]}://${decodeURIComponent(url.split('/')[1])}`
    }

    return proxifiedUrl
}

async function getFileContentThroughServiceProxy(fileUrl: string): Promise<ArrayBuffer> {
    const proxifyGetResponse = await axios.get(proxifyUrl(fileUrl), {
        responseType: 'arraybuffer',
    })
    return proxifyGetResponse.data
}

export const fileProxyAPI = {
    transformFileUrl,
    proxifyUrl,
    unProxifyUrl,
    getFileContentThroughServiceProxy,
}
export default fileProxyAPI
