import axios from 'axios'
import FormData from 'form-data'
import pako from 'pako'

import { proxifyUrl } from '@/api/file-proxy.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import log from '@/utils/logging'
import { isInternalUrl } from '@/utils/utils'

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
 * Loads the XML data from the file of a given KML layer, using the KML file URL of the layer.
 *
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<ArrayBuffer>}
 */
export function loadKmlData(kmlLayer) {
    return new Promise((resolve, reject) => {
        if (!kmlLayer) {
            reject(new Error('Missing KML layer, cannot load data'))
        }
        if (!kmlLayer.kmlFileUrl) {
            reject(
                new Error(`No file URL defined in this KML layer, cannot load data ${kmlLayer.id}`)
            )
        }
        // The file might be a KMZ file, which is a zip archive. Reading zip archive as text
        // is asking for trouble therefore we use ArrayBuffer
        getFileFromUrl(kmlLayer.kmlFileUrl, { responseType: 'arraybuffer' })
            .then((response) => {
                if (response.status === 200 && response.data) {
                    resolve(response.data)
                } else {
                    const msg = `Incorrect response while getting KML file data for layer ${kmlLayer.id}`
                    log.error(msg, response)
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                const msg = `Failed to load KML data: ${error}`
                log.error(msg)
                reject(new Error(msg))
            })
    })
}

/**
 * Generic function to load a file from a given URL.
 *
 * When the URL is not an internal url and it doesn't support CORS or use HTTP it is sent over a
 * proxy.
 *
 * @param {string} url URL to fetch
 * @param {Number} [options.timeout] How long should the call wait before timing out
 * @param {string} [options.responseType] Type of data that the server will respond with. Options
 *   are 'arraybuffer', 'document', 'json', 'text', 'stream'. Default is `json`
 * @returns {Promise<AxiosResponse<any, any>>}
 */
export async function getFileFromUrl(url, options = {}) {
    const { timeout = null, responseType = null } = options
    if (/^https?:\/\/localhost/.test(url) || isInternalUrl(url)) {
        // don't go through proxy if it is on localhost or the internal server
        return axios.get(url, { timeout, responseType })
    } else if (url.startsWith('http://')) {
        // HTTP request goes through the proxy
        return axios.get(proxifyUrl(url), { timeout, responseType })
    }

    // For other urls we need to check if they support CORS
    let supportCORS = false
    try {
        // unfortunately we cannot do a real preflight call using options because browser don't
        // allow to set the Access-Control-* headers ! Also there is no way to find out if a request
        // is failing due to network reason or due to CORS issue,
        // see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors
        // Therefore here we try to get the resource using head instead
        await axios.head(url, { timeout })
        supportCORS = true
    } catch (error) {
        log.error(
            `URL ${url} failed with ${error}. It might be due to CORS issue, ` +
                `therefore the request will be fallback to the service-proxy`
        )
    }

    if (supportCORS) {
        // Server support CORS
        return axios.get(url, { timeout, responseType })
    }
    // server don't support CORS use proxy
    return axios.get(proxifyUrl(url), { timeout, responseType })
}
