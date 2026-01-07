import type { SingleCoordinate } from '@swissgeo/coordinates'

import { coordinatesUtils, LV03, LV95 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import axios from 'axios'

import type { ReframeConfig } from '@/types/lv03Reframe'

import LogColorPerService from '@/config/log'

const REFRAME_BASE_URL = 'https://geodesy.geo.admin.ch/reframe/'

const logConfig = {
    title: 'Reframe API',
    titleColor: LogColorPerService.lv03Reframe,
}

/**
 * Re-frames LV95 coordinate taking all LV03 -> LV95 deformation into account (they are not stable,
 * so using "simple" proj4 matrices isn't enough to get a very accurate result)
 *
 * @returns Input coordinates re-framed by the backend service, and re-projected in the output
 *   projection.
 * @see https://www.swisstopo.admin.ch/en/rest-api-geoservices-reframe-web
 * @see https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/ReframeService.js
 */
export function reframe(config: ReframeConfig): Promise<SingleCoordinate> {
    const { inputCoordinates, inputProjection, outputProjection } = config ?? {}
    return new Promise((resolve, reject) => {
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
                    let outputCoordinates: SingleCoordinate = response.data.coordinates
                    if (outputProjection && outputProjection !== backendResponseProjection) {
                        outputCoordinates = coordinatesUtils.reprojectAndRound(
                            backendResponseProjection,
                            outputProjection,
                            outputCoordinates
                        )
                    }
                    resolve(outputCoordinates)
                } else {
                    log.error({
                        ...logConfig,
                        messages: [
                            'Error while re-framing coordinate',
                            inputCoordinates,
                            'fallback to proj4',
                        ],
                    })
                    resolve(
                        coordinatesUtils.reprojectAndRound(
                            inputProjection,
                            outputProjection ?? backendResponseProjection,
                            inputCoordinates
                        )
                    )
                }
            })
            .catch((error) => {
                log.error({
                    ...logConfig,
                    messages: ['Error while re-framing coordinate', inputCoordinates, error],
                })
                reject(new Error(error))
            })
    })
}

export const lv03ReframeAPI = {
    reframe,
}
export default lv03ReframeAPI
