import type { KMLLayer, KMLMetadata } from '@geoadmin/layers'

import log, { LogPreDefinedColor } from '@geoadmin/log'
import axios from 'axios'
import FormData from 'form-data'
import pako from 'pako'

import { proxifyUrl } from '@/api/file-proxy.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'

const LOG_BACKGROUND_COLOR = LogPreDefinedColor.Indigo

function generateKMLMetadataFromAPIData(data: any, preExistingAdminId?: string): KMLMetadata {
    let id: string | undefined
    let adminId: string | undefined = preExistingAdminId
    let created: Date | undefined
    let updated: Date | undefined
    let author: string | undefined
    let authorVersion: string | undefined

    if ('id' in data) {
        id = data.id
    }
    if (!adminId && 'admin_id' in data) {
        adminId = data.admin_id
    }
    if ('created' in data && typeof data.created === 'string') {
        created = new Date(data.created)
    }
    if ('updated' in data && typeof data.updated === 'string') {
        updated = new Date(data.updated)
    }
    if ('author' in data && typeof data.author === 'string') {
        author = data.author
    }
    if ('author_version' in data && typeof data.author_version === 'string') {
        authorVersion = data.author_version
    }
    if (!id || !created || !updated || !author || !authorVersion) {
        throw new Error(`Missing required fields in KML metadata response: ${JSON.stringify(data)}`)
    }

    let metadataLink: string | undefined
    let kmlLink: string | undefined

    if ('links' in data) {
        const links = data.links
        if ('self' in links && typeof links.self === 'string') {
            metadataLink = links.self
        }
        if ('kml' in links && typeof links.kml === 'string') {
            kmlLink = links.kml
        }
    }

    if (!metadataLink) {
        throw new Error(`Missing metadata link in KML metadata response: ${JSON.stringify(data)}`)
    }
    if (!kmlLink) {
        throw new Error(`Missing KML link in KML metadata response: ${JSON.stringify(data)}`)
    }

    return {
        id,
        adminId,
        created,
        updated,
        author,
        authorVersion,
        links: {
            metadata: metadataLink,
            kml: kmlLink,
        },
    }
}

// using a function so that any URL override made while using the app will be taken into account
function getKMLBaseUrl(): string {
    return `${getServiceKmlBaseUrl()}api/kml/`
}

type PromiseReject = (reason: Error) => void

function validateId(id: string | undefined, reject: PromiseReject) {
    if (!id) {
        const errorMessage = `Needs a valid kml ID`
        log.error({
            title: 'KML File API / validateId',
            titleStyle: {
                backgroundColor: LOG_BACKGROUND_COLOR,
            },
            messages: [errorMessage, id],
        })
        reject(new Error(errorMessage))
    }
}

function validateAdminId(adminId: string | undefined, reject: PromiseReject) {
    if (!adminId) {
        const errorMessage = `Needs a valid kml adminId`
        log.error({
            title: 'KML File API / validateAdminId',
            titleStyle: {
                backgroundColor: LOG_BACKGROUND_COLOR,
            },
            messages: [errorMessage, adminId],
        })
        reject(new Error(errorMessage))
    }
}

function validateKmlContent(kmlContent: string | undefined, reject: PromiseReject) {
    if (!kmlContent || !kmlContent.length) {
        const errorMessage = `Needs a valid KML`
        log.error({
            title: 'KML File API / validateKmlContent',
            titleStyle: {
                backgroundColor: LOG_BACKGROUND_COLOR,
            },
            messages: [errorMessage, kmlContent],
        })
        reject(new Error(errorMessage))
    }
}

function generateFormDataForKML(kmlContent: string, reject: PromiseReject): FormData {
    validateKmlContent(kmlContent, reject)
    const form = new FormData()
    const kmz = pako.gzip(kmlContent)
    const blob = new Blob([kmz], { type: 'application/vnd.google-earth.kml+xml' })
    form.append('kml', blob)
    form.append('author', 'web-mapviewer')
    form.append('author_version', '1.0.0')
    return form
}

/**
 * Get KML file URL on service-kml backend/S3 bucket
 *
 * @param id KML ID
 * @returns URL to the KML file on our service-kml backend
 */
export function getKmlUrl(id: string): string {
    return `${getKMLBaseUrl()}files/${id}`
}

/** Publish a new KML on the backend and receives back the metadata of the new file */
export function createKml(kmlContent: string): Promise<KMLMetadata> {
    return new Promise((resolve, reject) => {
        const form = generateFormDataForKML(kmlContent, reject)
        axios
            .post(`${getKMLBaseUrl()}admin`, form)
            .then((response) => {
                if (
                    response.status === 201 &&
                    response.data &&
                    response.data.id &&
                    response.data.admin_id
                ) {
                    resolve(generateKMLMetadataFromAPIData(response.data))
                } else {
                    const msg = 'Incorrect response while creating a file'
                    log.error({
                        title: 'KML File API / createKml',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / createKml',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while creating a file', kmlContent, error],
                })
                reject(new Error(error))
            })
    })
}

/** Update a KML on the backend */
export function updateKml(id: string, adminId: string, kmlContent: string): Promise<KMLMetadata> {
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        validateAdminId(adminId, reject)
        const form = generateFormDataForKML(kmlContent, reject)
        form.append('admin_id', adminId)
        axios
            .put(`${getKMLBaseUrl()}admin/${id}`, form)
            .then((response) => {
                if (
                    response.status === 200 &&
                    response.data &&
                    response.data.id &&
                    response.data.admin_id
                ) {
                    resolve(generateKMLMetadataFromAPIData(response.data))
                } else {
                    const msg = `Incorrect response while updating file with id=${id}`
                    log.error({
                        title: 'KML File API / updateKml',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / updateKml',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while updating file with id=', id, kmlContent, error],
                })
                reject(new Error(error))
            })
    })
}

/** Delete a KML on the backend */
export function deleteKml(id: string, adminId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        validateId(id, reject)
        validateAdminId(adminId, reject)
        const form = new FormData()
        form.append('admin_id', adminId)
        axios
            .request({
                method: 'DELETE',
                url: `${getKMLBaseUrl()}admin/${id}`,
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
                    log.error({
                        title: 'KML File API / deleteKml',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / deleteKml',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while deleting file with id=', id, error],
                })
                reject(new Error(error))
            })
    })
}

/** Get the KML file's content from the given URL */
export function getKmlFromUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        axios
            .get(url)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    resolve(response.data)
                } else {
                    const msg = `Incorrect response while getting file with url=${url}`
                    log.error({
                        title: 'KML File API / getKmlFromUrl',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / getKmlFromUrl',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while getting file with url=', url, error],
                })
                reject(new Error(error))
            })
    })
}

/** Get the KML's metadata by its adminId */
export function getKmlMetadataByAdminId(adminId: string): Promise<KMLMetadata> {
    return new Promise((resolve, reject) => {
        validateAdminId(adminId, reject)
        axios
            .get(`${getKMLBaseUrl()}admin`, {
                params: {
                    admin_id: adminId,
                },
            })
            .then((response) => {
                if (response.status === 200 && response.data) {
                    resolve(generateKMLMetadataFromAPIData(response.data))
                } else {
                    const msg = `Incorrect response while getting metadata for kml admin_id=${adminId}`
                    log.error({
                        title: 'KML File API / getKmlMetadataByAdminId',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / getKmlMetadataByAdminId',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while getting metadata for kml admin_id=', adminId, error],
                })
                reject(new Error(error))
            })
    })
}

/**
 * Get KML metadata for a KML layer (using its fileId to request the backend)
 *
 * If this KML file is not managed by our infrastructure (e.g., external KML), this will reject the
 * request (the promise will be rejected)
 */
export function loadKmlMetadata(kmlLayer: KMLLayer): Promise<KMLMetadata> {
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
            .get(`${getKMLBaseUrl()}admin/${kmlLayer.fileId}`)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const metadata = generateKMLMetadataFromAPIData(response.data, kmlLayer.adminId)
                    resolve(metadata)
                } else {
                    const msg = `Incorrect response while getting metadata for KML layer ${kmlLayer.id}`
                    log.error({
                        title: 'KML File API / loadKmlMetadata',
                        titleStyle: {
                            backgroundColor: LOG_BACKGROUND_COLOR,
                        },
                        messages: [msg, response],
                    })
                    reject(new Error(msg))
                }
            })
            .catch((error) => {
                log.error({
                    title: 'KML File API / loadKmlMetadata',
                    titleStyle: {
                        backgroundColor: LOG_BACKGROUND_COLOR,
                    },
                    messages: ['Error while getting metadata for KML layer', kmlLayer.id, error],
                })
                reject(new Error(error))
            })
    })
}

/** Load the content of a file from a given URL as ArrayBuffer. */
export async function getFileContentFromUrl(url: string): Promise<ArrayBuffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return response.data
}

interface OnlineFileCompliance {
    mimeType?: string
    supportsCORS: boolean
    supportsHTTPS: boolean
}

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
 */
export async function checkOnlineFileCompliance(url: string): Promise<OnlineFileCompliance> {
    const supportsHTTPS = url.startsWith('https://')
    if (supportsHTTPS) {
        try {
            const headResponse = await axios.head(url)
            let mimeType: string | undefined
            if (headResponse?.headers) {
                mimeType = headResponse.headers['content-type']
            }
            return {
                mimeType,
                supportsCORS: true,
                supportsHTTPS,
            }
        } catch (error) {
            log.error({
                title: 'KML File API / checkOnlineFileCompliance',
                titleStyle: {
                    backgroundColor: LOG_BACKGROUND_COLOR,
                },
                messages: ['HEAD request on URL', url, 'failed with', error],
            })
        }
    }
    try {
        const proxyHeadResponse = await axios.head(proxifyUrl(url))
        let mimeType: string | undefined
        if (proxyHeadResponse?.headers) {
            mimeType = proxyHeadResponse.headers['content-type']
        }
        return {
            mimeType,
            supportsCORS: false,
            supportsHTTPS,
        }
    } catch (errorWithProxy) {
        log.error({
            title: 'KML File API / checkOnlineFileCompliance',
            titleStyle: {
                backgroundColor: LOG_BACKGROUND_COLOR,
            },
            messages: ['HEAD request through proxy on URL', url, 'failed with', errorWithProxy],
        })
        return { mimeType: undefined, supportsCORS: false, supportsHTTPS }
    }
}
