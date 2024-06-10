import axios from 'axios'
import proj4 from 'proj4'

import { LV03, LV95 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const REFRAME_BASE_URL = 'https://geodesy.geo.admin.ch/reframe/'

/**
 * Re-frames LV95 coordinate taking all LV03 -> LV95 deformation into account (they are not stable,
 * so using "simple" proj4 matrices isn't enough to get a very accurate result)
 *
 * @param {[Number, Number]} lv95coordinate LV95 coordinate that we want expressed in LV03
 * @returns {Promise<[Number, Number]>} Input LV95 coordinate re-framed by the backend service into
 *   LV03 coordinate
 * @see https://www.swisstopo.admin.ch/en/rest-api-geoservices-reframe-web
 * @see https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/ReframeService.js
 */
export default function reframe(lv95coordinate) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(lv95coordinate) || lv95coordinate.length !== 2) {
            reject(new Error('lv95coordinate must be an array with length of 2'))
        }
        axios({
            method: 'GET',
            url: `${REFRAME_BASE_URL}lv95tolv03`,
            params: {
                easting: lv95coordinate[0],
                northing: lv95coordinate[1],
            },
        })
            .then((response) => {
                if (response.data?.coordinates) {
                    resolve(response.data.coordinates)
                } else {
                    log.error(
                        'Error while re-framing coordinate',
                        lv95coordinate,
                        'fallback to proj4'
                    )
                    resolve(proj4(LV95.epsg, LV03.epsg, lv95coordinate))
                }
            })
            .catch((error) => {
                log.error('Error while re-framing coordinate', lv95coordinate, error)
                reject(error)
            })
    })
}
