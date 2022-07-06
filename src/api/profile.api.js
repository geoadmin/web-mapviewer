import log from '@/utils/logging'
import axios from 'axios'
import { API_SERVICE_ALTI_BASE_URL } from '@/config'

/**
 * @typedef ProfileRequestData
 * @property {GeoJSON} geom A GeoJSON object representation of a polyline (type = LineString)
 * @property {Number} [sr] The reference system to use (EPSG code). Valid value are 2056 (for LV95)
 *   and 21781 (for LV03)
 * @property {Number} [nb_points] The number of points used for the polyline segmentation. Default “200”.
 * @property {Number} [offset] The offset value (INTEGER) in order to use the exponential moving
 *   algorithm. For a given value the offset value specify the number of values before and after
 *   used to calculate the average.
 * @property {Boolean} [distinct_points] If True, it will ensure the coordinates given to the
 *   service are part of the response. Possible values are True or False, default to False.
 */

/**
 * @typedef GeoJSON A GeoJSON object
 * @property {string} type
 * @property {[[Number]]} coordinates
 */

/**
 * @typedef ProfileAlts
 * @property {Number} DTM2
 * @property {Number} COMB
 * @property {Number} DTM25
 */

/**
 * @typedef ProfilePoint
 * @property {Number} dist Distance from first to current point
 * @property {Number} easting Coordinate
 * @property {Number} northing Coordinate
 * @property {ProfileAlts} alts Point altitude in different elevation models
 */

/**
 * Gets profile from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {ProfileRequestData} data
 * @param {String} FileExtension .json (default) and .csv are possible file extensions
 * @returns {Promise<ProfilePoint[]>}
 */
const profile = (data, fileExtension) => {
    return new Promise((resolve, reject) => {
        if (fileExtension !== '.json' && fileExtension !== '.csv') {
            const errorMessage = `Not supported file extension`
            log.error(errorMessage)
            reject(errorMessage)
        }
        if (!data || !data.geom) {
            const errorMessage = `Geom not provided`
            log.error(errorMessage)
            reject(errorMessage)
        }
        const geoJson = data.geom
        delete data.geom
        const params = new URLSearchParams(data)
        axios
            .post(
                `${API_SERVICE_ALTI_BASE_URL}rest/services/profile${fileExtension}?${params.toString()}`,
                geoJson
            )
            .then((response) => {
                if (response.data && response.data) {
                    resolve(response.data)
                } else {
                    const msg = 'Incorrect response while getting profile'
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error('Error while getting profile', data)
                reject(error)
            })
    })
}

/**
 * Gets profile in json format from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {ProfileRequestData} data
 * @returns {Promise<ProfilePoint[]>}
 */
export const profileJson = (data) => {
    return profile(data, '.json')
}

/**
 * Gets profile in csv format from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {ProfileRequestData} data
 * @returns {Promise<ProfilePoint[]>}
 */
export const profileCsv = (data) => {
    return profile(data, '.csv')
}
