import axios from 'axios'
import proj4 from 'proj4'
import { round } from '@/utils/numberUtils'
import log from '@/utils/logging'

// copied from https://developer.what3words.com/tutorial/detecting-if-text-is-in-the-format-of-a-3-word-address
const REGEX_WHAT_3_WORDS =
    /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i
const WHAT_3_WORDS_API_BASE_URL = 'https://api.what3words.com/v3'
const WHAT_3_WORDS_API_KEY = 'OM48J50Y'

/**
 * Check if text is a valid what3word (uses the regex provided by what3words.com)
 *
 * @param text
 * @returns {boolean}
 */
export const isWhat3WordsString = (text) => {
    return REGEX_WHAT_3_WORDS.test(text)
}

/**
 * Returns a Promise that will request a location to the What3Words API backend and returns it if it
 * exists there (otherwise fails)
 *
 * @param {String} what3wordsString A what3word string (validity will be checked before sending it to the API)
 * @returns {Promise<Number[]>} Lat, lon array (in EPSG:3857 so in meters)
 */
export const retrieveWhat3WordsLocation = (what3wordsString) => {
    return new Promise((resolve, reject) => {
        if (!isWhat3WordsString(what3wordsString)) {
            reject('Bad what3words string :' + what3wordsString)
        } else {
            axios
                .get(
                    `${WHAT_3_WORDS_API_BASE_URL}/convert-to-coordinates?words=${what3wordsString}&key=${WHAT_3_WORDS_API_KEY}`
                )
                // Response structure in the doc : https://developer.what3words.com/public-api/docs#convert-to-coords
                .then((response) => {
                    const what3wordLocationEpsg3857 = proj4(proj4.WGS84, 'EPSG:3857', [
                        round(response.data.coordinates.lng, 5),
                        round(response.data.coordinates.lat, 5),
                    ])
                    resolve([
                        round(what3wordLocationEpsg3857[0], 1),
                        round(what3wordLocationEpsg3857[1], 1),
                    ])
                })
                .catch((error) => {
                    log('error', 'Error while fetching What3Words location', error)
                    reject(error)
                })
        }
    })
}

/**
 * Sends the location given in param to what3words backend in get the equivalent what3word entry for
 * this coordinate
 *
 * @param location A location expressed in EPSG:3857 projection
 * @param lang The ISO code for the language that should be used to build this w3w
 * @returns {Promise<String>} The what3words for this location
 */
export const registerWhat3WordsLocation = (location, lang = 'en') => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(location) && location.length !== 2) {
            reject('Bad location, must be a coordinate array')
        } else {
            // transforming EPSG:3857 coordinates into EPGS:4326 (WGS84)
            const [lat, lon] = proj4('EPSG:3857', proj4.WGS84, location)
            axios
                .get(`${WHAT_3_WORDS_API_BASE_URL}/convert-to-3wa`, {
                    params: {
                        coordinates: `${lat},${lon}`,
                        language: lang,
                        key: WHAT_3_WORDS_API_KEY,
                    },
                })
                // Response structure in the doc : https://developer.what3words.com/public-api/docs#convert-to-3wa
                .then((response) => resolve(response.data.words))
                .catch((error) => {
                    log('error', 'Error while saving location as a What3words', error)
                    reject(error)
                })
        }
    })
}
