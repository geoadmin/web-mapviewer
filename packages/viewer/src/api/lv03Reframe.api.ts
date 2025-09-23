import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'
import { coordinatesUtils, LV03, LV95 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

const REFRAME_BASE_URL = 'https://geodesy.geo.admin.ch/reframe/'

interface ReframeConfig {
    /** LV95 or LV03 coordinate that we want expressed in the other coordinate system */
    inputCoordinates: SingleCoordinate
    /** Tells which projection is used to describe the input coordinate. Must be either LV03 or LV95. */
    inputProjection: CoordinateSystem
    /**
     * Tells which projection the output coordinates should be expressed into. If nothing is given,
     * the "opposite" swiss projection of the input will be chosen (if LV03 coordinates are given,
     * the output will be LV95 coordinates, and vice versa)
     */
    outputProjection?: CoordinateSystem
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
export default function reframe(config: ReframeConfig): Promise<SingleCoordinate> {
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
                        title: 'Reframe API',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Zinc,
                        },
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
                    title: 'Reframe API',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Zinc,
                    },
                    messages: ['Error while re-framing coordinate', inputCoordinates, error],
                })
                reject(new Error(error))
            })
    })
}
