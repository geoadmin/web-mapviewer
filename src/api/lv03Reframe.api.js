import axios from 'axios'

import { LV03, LV95 } from '@/utils/coordinates/coordinateSystems'
import { reprojectAndRound } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

const REFRAME_BASE_URL = 'https://geodesy.geo.admin.ch/reframe/'

/**
 * Re-frames LV95 coordinate taking all LV03 -> LV95 deformation into account (they are not stable,
 * so using "simple" proj4 matrices isn't enough to get a very accurate result)
 *
 * @param {[Number, Number]} config.inputCoordinates LV95 or LV03 coordinate that we want expressed
 *   in the other coordinate system
 * @param {CoordinateSystem} config.inputProjection Which projection is used to describe the input
 *   coordinate, must be either LV03 or LV95.
 * @param {CoordinateSystem} config.outputProjection In which projection the output coordinates
 *   should be expressed into. If nothing is given, the "opposite" swiss projection of the input
 *   will be chosen (if LV03 coordinates are given, the output will be LV95 coordinates (and
 *   vice-versa))
 * @returns {Promise<[Number, Number]>} Input coordinates re-framed by the backend service, and
 *   re-projected in the output projection.
 * @see https://www.swisstopo.admin.ch/en/rest-api-geoservices-reframe-web
 * @see https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/ReframeService.js
 */
export default function reframe(config = {}) {
    return new Promise((resolve, reject) => {
        const { inputCoordinates, inputProjection, outputProjection = null } = config
        if (!Array.isArray(inputCoordinates) || inputCoordinates.length !== 2) {
            reject(new Error('inputCoordinates must be an array with length of 2'))
        }
        if (![LV03.epsg, LV95.epsg].includes(inputProjection?.epsg)) {
            reject(new Error('inputProjection must be LV03 or LV95'))
        }
        const backendResponseProjection = inputProjection === LV03 ? LV95 : LV03
        axios({
            method: 'GET',
            url: `${REFRAME_BASE_URL}${inputProjection === LV95 ? 'lv95tolv03' : 'lv03tolv95'}`,
            params: {
                easting: inputCoordinates[0],
                northing: inputCoordinates[1],
            },
        })
            .then((response) => {
                if (response.data?.coordinates) {
                    let outputCoordinates = [...response.data.coordinates]
                    if (outputProjection && outputProjection !== backendResponseProjection) {
                        outputCoordinates = reprojectAndRound(
                            backendResponseProjection,
                            outputProjection,
                            outputCoordinates
                        )
                    }
                    resolve(outputCoordinates)
                } else {
                    log.error(
                        'Error while re-framing coordinate',
                        inputCoordinates,
                        'fallback to proj4'
                    )
                    resolve(
                        reprojectAndRound(
                            inputProjection,
                            outputProjection ?? backendResponseProjection,
                            inputCoordinates
                        )
                    )
                }
            })
            .catch((error) => {
                log.error('Error while re-framing coordinate', inputCoordinates, error)
                reject(error)
            })
    })
}
