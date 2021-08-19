import { API_SERVICE_ICON_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'

/** @returns {Promise<Object>} */
export function getIconsets() {
    return axios
        .get(`${API_SERVICE_ICON_BASE_URL}v4/icons/sets`)
        .then((iconsets) => iconsets.data.items)
        .catch((error) => {
            log('error', 'Error getting iconsets')
            return Promise.reject(error)
        })
}

/**
 * @param {string} url
 * @returns {Promise<Object>}
 */
export function getIcons(url) {
    return axios
        .get(url)
        .then((icons) => icons.data.items)
        .catch((error) => {
            log('error', 'Error getting icons', url)
            return Promise.reject(error)
        })
}
