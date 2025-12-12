import type { SingleCoordinate, CoordinateSystem } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'
import proj4 from 'proj4'

// copied from https://developer.what3words.com/tutorial/detecting-if-text-is-in-the-format-of-a-3-word-address
const REGEX_WHAT_3_WORDS =
    /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i
const WHAT_3_WORDS_API_BASE_URL = 'https://api.what3words.com/v3'
const WHAT_3_WORDS_API_KEY = 'OM48J50Y'

/** Check if the text is a valid what3word (uses the regex provided by what3words.com) */
export function isWhat3WordsString(text: string): boolean {
    return REGEX_WHAT_3_WORDS.test(text)
}

/**
 * Returns a Promise that will request a location to the What3Words API backend and returns it if it
 * exists there (otherwise fails)
 *
 * @param what3wordsString A what3word string (validity will be checked before sending it to the
 *   API)
 * @param outputProjection The wanted output projection for the W3W result
 */
export function retrieveWhat3WordsLocation(
    what3wordsString: string,
    outputProjection: CoordinateSystem
): Promise<SingleCoordinate> {
    return new Promise((resolve, reject) => {
        if (!isWhat3WordsString(what3wordsString)) {
            reject(new Error('Bad what3words string :' + what3wordsString))
        } else {
            axios
                .get(
                    `${WHAT_3_WORDS_API_BASE_URL}/convert-to-coordinates?words=${what3wordsString}&key=${WHAT_3_WORDS_API_KEY}`
                )
                // Response structure in the doc: https://developer.what3words.com/public-api/docs#convert-to-coords
                .then((response) => {
                    const what3wordLocationEpsg3857 = proj4(WGS84.epsg, outputProjection.epsg, [
                        response.data.coordinates.lng,
                        response.data.coordinates.lat,
                    ])
                    resolve([
                        outputProjection.roundCoordinateValue(what3wordLocationEpsg3857[0]),
                        outputProjection.roundCoordinateValue(what3wordLocationEpsg3857[1]),
                    ])
                })
                .catch((error) => {
                    log.error({
                        title: 'What3Words API',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Rose,
                        },
                        messages: [
                            'Error while fetching What3Words location',
                            what3wordsString,
                            error,
                        ],
                    })
                    reject(new Error(error))
                })
        }
    })
}

/**
 * Sends the location given in param to what3words backend in get the equivalent what3word entry for
 * this coordinate
 *
 * @param location A location expressed in the given projection
 * @param projection Projection currently in use (to express location)
 * @param lang The ISO code for the language that should be used to build this w3w (will default to
 *   English if none is given)
 * @returns The what3words for this location
 */
export function registerWhat3WordsLocation(
    location: SingleCoordinate,
    projection: CoordinateSystem,
    lang: string = 'en'
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!Array.isArray(location) || location.length !== 2) {
            reject(new Error('Bad location, must be a coordinate array'))
        } else {
            let [lon, lat] = location
            if (projection.epsg !== WGS84.epsg) {
                ;[lon, lat] = proj4(projection.epsg, WGS84.epsg, location)
            }
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
                    log.error({
                        title: 'What3Words API',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Rose,
                        },
                        messages: ['Error while fetching What3Words location', location, error],
                    })
                    reject(new Error(error))
                })
        }
    })
}
