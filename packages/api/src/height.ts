import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'

import { LV95 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import { getApi3BaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'
import proj4 from 'proj4'

import type { HeightForPosition } from '@/types/height'

import LogColorPerService from '@/config/log'

const meterToFeetFactor: number = 3.28084

const logConfig = {
    title: 'Height API',
    titleColor: LogColorPerService.height,
}

/**
 * Get the height of the given coordinate from the backend
 *
 * @param coordinates Coordinates of the point we want to know the height of
 * @param projection The projection in which this point is expressed
 * @returns The height for the given coordinate
 */
function getHeightForPosition(
    coordinates: SingleCoordinate,
    projection: CoordinateSystem
): Promise<HeightForPosition> {
    return new Promise((resolve, reject) => {
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            // this service only functions with LV95 coordinate, so we have to re-project the input to be sure
            // we are giving it LV95 coordinates
            const lv95coords = proj4(projection.epsg, LV95.epsg, coordinates)
            axios
                .get(`${getApi3BaseUrl()}rest/services/height`, {
                    params: {
                        easting: lv95coords[0],
                        northing: lv95coords[1],
                    },
                })
                .then((heightResponse) => {
                    resolve({
                        coordinates,
                        heightInMeter: heightResponse.data.height,
                        heightInFeet: round(heightResponse.data.height * meterToFeetFactor, 1),
                    })
                })
                .catch((error) => {
                    log.error({
                        ...logConfig,
                        messages: ['Error while retrieving height for', coordinates, error],
                    })
                    reject(new Error(error))
                })
        } else {
            const errorMessage = 'Invalid coordinates, no height requested'
            log.error({
                ...logConfig,
                messages: ['Invalid coordinates, no height requested', coordinates],
            })
            reject(new Error(errorMessage))
        }
    })
}

export const heightAPI = {
    getHeightForPosition,
}
export default heightAPI
