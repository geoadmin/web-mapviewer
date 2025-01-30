import axios from 'axios'
import FormData from 'form-data'
import pako from 'pako'

import { proxifyUrl } from '@/api/file-proxy.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import log from '@/utils/logging'

/**
 * KML links
 *
 * @property {string} metadata URL link to the file ressource metadata
 * @property {string} kml URL link to the file
 */
export class KmlLinks {
    /**
     * Construct a KmlLinks oject from the KML API response
     *
     * @param {object} data KML API links response as defined in
     *   geoadmin/doc-specs-api/#public.geo.admin.ch/public.geo.admin.ch.yaml
     * @returns {KmlLinks} KmlLinks object
     * @static
     */
    static fromApiData(data) {
        const obj = new KmlLinks()
        obj.metadata = data.self
        obj.kml = data.kml
        return obj
    }
}

/**
 * KML Metadata
 *
 * @property {string} id The file ID to use to access the ressource and metadata
 * @property {string | null} adminId The file admin ID to use if the user wants to modify this file
 *   later (without changing his sharing links)
 * @property {FileLinks} links Links to the ressource
 * @property {string} created Date time in ISO format of the ressource creation
 * @property {string} updated Date time in ISO format of the ressource has been modified
 * @property {string} author Author of the KML
 * @property {string} authorVersion Version of the KML drawing
 */
export class KmlMetadata {
    /**
     * Construct a KmlMetadata oject from the KML API response
     *
     * @param {object} data KML API response as defined in
     *   geoadmin/doc-specs-api/#public.geo.admin.ch/public.geo.admin.ch.yaml
     * @returns {KmlMetadata} KmlMetaData object
     * @static
     */
    static fromApiData(data) {
        const obj = new KmlMetadata()
        obj.id = data.id
        if (data.admin_id) {
            obj.adminId = data.admin_id
        } else {
            obj.adminId = null
        }
        obj.links = KmlLinks.fromApiData(data.links)
        obj.created = data.created
        obj.updated = data.updated
        obj.author = data.author
        obj.authorVersion = data.author_version
        return obj
    }
}

const kmlBaseUrl = `${getServiceKmlBaseUrl()}api/kml/`

function validateId(id, reject) {
    if (!id) {
        const errorMessage = `Needs a valid kml ID`
        log.error(errorMessage)
        reject(errorMessage)
    }
}

function validateAdminId(adminId, reject) {
    if (!adminId) {
        const errorMessage = `Needs a valid kml adminId`
        log.error(errorMessage)
        reject(errorMessage)
    }
}

function validateKml(kml, reject) {
    if (!kml || !kml.length) {
        const errorMessage = `Needs a valid KML`
        log.error(errorMessage)
        reject(errorMessage)
    }
}

function buildKmlForm(kml, reject) {
    validateKml(kml, reject)
    const form = new FormData()
    const kmz = pako.gzip(kml)
    const blob = new Blob([kmz], { type: 'application/vnd.google-earth.kml+xml' })
    form.append('kml', blob)
    return form
}

/**
 * Get KML file URL
 *
 * @param {string} id KML id
 * @returns {string} URL of the kml file
 */
export const getKmlUrl = (id) => {
    return `${kmlBaseUrl}files/${id}`
}

/**
 * Publish KML on backend
 *
 * @param {string} kml KML content
 * @returns {Promise<KmlMetadata>}
 */
export const createKml = (kml) => {
    return new Promise((resolve, reject) => {
        const form = buildKmlForm(kml)
        form.append('author', 'web-mapviewer')
        form.append('author_version', '1.0.0')
        axios
            .post(`${kmlBaseUrl}admin`, form)
            .then((response) => {
                if (
                    response.status === 201 &&
                    response.data &&
                    response.data.id &&
                    response.data.admin_id
                ) {
                    resolve(KmlMetadata.fromApiData(response.data))
                } else {
                    const msg = 'Incorrect response while creating a file'
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error('Error while creating a file', kml, error)
                reject(error)
            })
    })
}

/**
 * Update KML on backend
 *
 * @param {string} id KML ID
 * @param {string} adminId KML admin ID
 * @param {string} kml KML content
 * @returns {Promise<KmlMetadata>}
 */
export const updateKml = (id, adminId, kml) => {
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        validateAdminId(adminId, reject)
        const form = buildKmlForm(kml, reject)
        form.append('admin_id', adminId)
        axios
            .put(`${kmlBaseUrl}admin/${id}`, form)
            .then((response) => {
                if (
                    response.status === 200 &&
                    response.data &&
                    response.data.id &&
                    response.data.admin_id
                ) {
                    resolve(KmlMetadata.fromApiData(response.data))
                } else {
                    const msg = `Incorrect response while updating file with id=${id}`
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error(`Error while updating file with id=${id}`, kml, error)
                reject(error)
            })
    })
}

/**
 * Delete KML on backend
 *
 * @param {string} id KML ID
 * @param {string} adminId KML admin ID
 * @returns {Promise<void>}
 */
export const deleteKml = (id, adminId) => {
    log.info('base url : ', kmlBaseUrl)
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        validateAdminId(adminId, reject)
        const form = new FormData()
        form.append('admin_id', adminId)
        axios
            .request({
                method: 'DELETE',
                url: `${kmlBaseUrl}admin/${id}`,
                data: form,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                if (response.status === 200 && response.data.id) {
                    resolve()
                } else {
                    const msg = `Incorrect response while deleting file with id=${id}`
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error(`Error while deleting file with id=${id}`, error)
                reject(error)
            })
    })
}

const _getKml = async (url, resolve, reject) => {
    try {
        const response = await axios.get(url)
        if (response.status === 200 && response.data) {
            resolve(response.data)
        } else {
            const msg = `Incorrect response while getting file with url=${url}`
            log.error(msg, response)
            reject(msg)
        }
    } catch (error) {
        log.error(`Error while getting file with url=${url}`, error)
        reject(error)
    }
}

/**
 * Get KML file given a Kml ID
 *
 * @param {string} id KML ID
 * @returns {Promise<string>} KML file content
 */
export const getKml = (id) => {
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        _getKml(getKmlUrl(id), resolve, reject)
    })
}

/**
 * Get KML file given an Url
 *
 * @param {string} url KML URL
 * @returns {Promise<string>} KML file content
 */
export const getKmlFromUrl = (url) => {
    return new Promise((resolve, reject) => _getKml(url, resolve, reject))
}

/**
 * Get KML metadata by adminId
 *
 * @param {string} adminId KML admin ID
 * @returns {Promise<KmlMetadata>} KML metadata
 */
export const getKmlMetadataByAdminId = (adminId) => {
    return new Promise((resolve, reject) => {
        validateAdminId(adminId, reject)
        axios
            .get(`${kmlBaseUrl}admin`, {
                params: {
                    admin_id: adminId,
                },
            })
            .then((response) => {
                if (response.status === 200 && response.data) {
                    resolve(KmlMetadata.fromApiData(response.data))
                } else {
                    const msg = `Incorrect response while getting metadata for kml admin_id=${adminId}`
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error(`Error while getting metadata for kml admin_id=${adminId}`, error)
                reject(error)
            })
    })
}

/**
 * Get KML metadata by for a KML layer (using its fileId to request the backend)
 *
 * If this KML file is not managed by our infrastructure (external KML) this will reject the request
 * (the promise will be rejected)
 *
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<KmlMetadata>}
 */
export function loadKmlMetadata(kmlLayer) {
    return new Promise((resolve, reject) => {
        if (!kmlLayer) {
            reject(new Error('Missing KML layer, cannot load metadata'))
        }
        if (!kmlLayer.fileId || kmlLayer.isExternal) {
            reject(
                new Error(
                    `This KML is not one managed by our infrastructure, metadata loading is not possible ${kmlLayer.id}`
                )
            )
        }
        axios
            .get(`${kmlBaseUrl}admin/${kmlLayer.fileId}`)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    let metadata = KmlMetadata.fromApiData(response.data)
                    if (kmlLayer.adminId) {
                        metadata.adminId = kmlLayer.adminId
                    }
                    resolve(metadata)
                } else {
                    const msg = `Incorrect response while getting metadata for KML layer ${kmlLayer.id}`
                    log.error(msg, response)
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error(`Error while getting metadata for KML layer ${kmlLayer.id}`, error)
                reject(new Error(error))
            })
    })
}

/**
 * Load content of a file from a given URL as ArrayBuffer.
 *
 * @param {string} url URL to fetch
 * @returns {Promise<ArrayBuffer>}
 */
export async function getFileContentFromUrl(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return response.data
}

/**
 * @typedef OnlineFileCompliance
 * @property {String | null} mimeType
 * @property {Boolean} supportsCORS If `true` it means that a HEAD request could go through CORS
 *   checks.
 * @property {Boolean} supportsHTTPS
 */

/**
 * Get a file MIME type through a HEAD request, and reading the Content-Type header returned by this
 * request. Returns `null` if the HEAD request failed, or if no Content-Type header is set.
 *
 * Will attempt to get the HEAD request through service-proxy if the first HEAD request failed.
 *
 * Will return if the first HEAD request was successful through a boolean called `supportCORS`, if
 * this is `true` it means that the first HEAD request could go through CORS checks.
 *
 * Also returns a flag telling if the file supports HTTPS or not.
 *
 * @param {String} url
 * @returns {Promise<OnlineFileCompliance>}
 */
export async function checkOnlineFileCompliance(url) {
    const supportsHTTPS = url.startsWith('https://')
    if (supportsHTTPS) {
        try {
            const headResponse = await axios.head(url)
            return {
                mimeType: headResponse.headers.get('content-type'),
                supportsCORS: true,
                supportsHTTPS,
            }
        } catch (error) {
            log.error(`HEAD request on URL ${url} failed with`, error)
        }
    }
    try {
        const proxyHeadResponse = await axios.head(proxifyUrl(url))
        return {
            mimeType: proxyHeadResponse.headers.get('content-type'),
            supportsCORS: false,
            supportsHTTPS,
        }
    } catch (errorWithProxy) {
        log.error('HEAD request through proxy failed for URL', url, errorWithProxy)
        return { mimeType: null, supportsCORS: false, supportsHTTPS }
    }
}
