import { API_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'

export class Files {
    constructor() {}

    create(kml) {
        return new Promise((resolve, reject) => {
            if (!kml || !kml.length) {
                const errorMessage = `KML not provided`
                log('error', errorMessage)
                reject(errorMessage)
            }
            axios
                .post(`${API_BASE_URL}files`, kml, {
                    headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
                })
                .then((response) => {
                    if (response.data && response.data.fileId && response.data.adminId) {
                        resolve(response.data)
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

    update(id, kml) {
        return new Promise((resolve, reject) => {
            if (!id) {
                const errorMessage = `Needs a valid file ID`
                log('error', errorMessage)
                reject(errorMessage)
            }
            if (!kml || !kml.length) {
                const errorMessage = `Needs a valid KML`
                log('error', errorMessage)
                reject(errorMessage)
            }
            axios
                .post(`${API_BASE_URL}files/${id}`, kml, {
                    headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
                })
                .then((response) => {
                    if (response.data && response.data.status === 'updated') {
                        resolve(response.data)
                    } else {
                        const msg = 'Incorrect response while creating a file'
                        log('error', msg, response)
                        reject(msg)
                    }
                })
                .catch((error) => {
                    log('error', `Error while updating a file: ${id}`, kml)
                    reject(error)
                })
        })
    }
}
