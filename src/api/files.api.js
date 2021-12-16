import { API_SERVICE_KML_BASE_URL, API_SERVICE_KML_STORAGE_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'
import FormData from 'form-data'

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
        return obj
    }
}

const urlPrefix = 'api/kml/'

function validateId(id, reject) {
    if (!id) {
        const errorMessage = `Needs a valid kml ID`
        log('error', errorMessage)
        reject(errorMessage)
    }
}

function validateAdminId(adminId, reject) {
    if (!adminId) {
        const errorMessage = `Needs a valid kml adminId`
        log('error', errorMessage)
        reject(errorMessage)
    }
}

function validateKml(kml, reject) {
    if (!kml || !kml.length) {
        const errorMessage = `Needs a valid KML`
        log('error', errorMessage)
        reject(errorMessage)
    }
}

function buildKmlForm(kml, reject) {
    validateKml(kml, reject)
    const form = new FormData()
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' })
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
    return `${API_SERVICE_KML_STORAGE_BASE_URL}${urlPrefix}files/${id}`
}

/**
 * Get KML file metada URL
 *
 * @param {string} id KML id
 * @returns {string} URL of the kml file metadata
 */
export const getKmlMetadataUrl = (id) => {
    return `${API_SERVICE_KML_BASE_URL}${urlPrefix}admin/${id}`
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
        axios
            .post(`${API_SERVICE_KML_BASE_URL}${urlPrefix}admin`, form)
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
                    log('error', msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log('error', 'Error while creating a file', kml)
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
            .put(`${API_SERVICE_KML_BASE_URL}${urlPrefix}admin/${id}`, form)
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
                    log('error', msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log('error', `Error while updating file with id=${id}`, kml)
                reject(error)
            })
    })
}

/**
 * Get KML file
 *
 * @param {string} id KML ID
 * @returns {Promise<string>} KML file content
 */
export const getKml = (id) => {
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        axios
            .get(getKmlUrl(id))
            .then((response) => {
                if (response.status === 200 && response.data) {
                    resolve(response.data)
                } else {
                    const msg = `Incorrect response while getting file with id=${id}`
                    log('error', msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log('error', `Error while getting file with id=${id}`)
                reject(error)
            })
    })
}
