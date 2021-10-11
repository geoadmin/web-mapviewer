import axios from 'axios'
import proj4 from 'proj4'
import log from '@/utils/logging'
import { API_BASE_URL } from '@/config'

/**
 * Get the height of the given coordinate from the backend
 *
 * @param {Number[]} coordinates Lat/lon coordinates expressed in EPSG:3857
 * @returns {Promise<Number>} The height for the given coordinate
 */
export const requestHeight = (coordinates) => {
    return new Promise((resolve, reject) => {
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            const lv95coords = proj4('EPSG:3857', 'EPSG:2056', coordinates)
            axios
                .get(`${API_BASE_URL}/rest/services/height`, {
                    params: {
                        easting: lv95coords[0],
                        northing: lv95coords[1],
                    },
                })
                .then((heightResponse) => {
                    resolve(heightResponse.data.height)
                })
                .catch((error) => {
                    log.error('Error while retrieving height for', coordinates, error)
                    reject(error)
                })
        } else {
            const errorMessage = 'Invalid coordinates, no height requested'
            log.error('Invalid coordinates, no height requested', coordinates)
            reject(errorMessage)
            reject(errorMessage)
        }
    })
}
