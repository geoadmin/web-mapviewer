import axios from 'axios'
import proj4 from 'proj4'

import { getServiceAltiBaseUrl } from '@/config/baseUrl.config'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'

export const meterToFeetFactor = 3.28084

export class HeightForPosition {
    /**
     * @param {Number[]} coordinates Lat/lon, the position for which the height was requested
     * @param {Number} heightInMeter The height for the position given by our backend
     */
    constructor(coordinates, heightInMeter) {
        this.coordinates = coordinates
        this.heightInMeter = heightInMeter
        this.heightInFeet = round(heightInMeter * meterToFeetFactor, 1)
    }
}

/**
 * Get the height of the given coordinate from the backend
 *
 * @param {Number[]} coordinates Coordinates of the point we want to know the height of
 * @param {CoordinateSystem} projection The projection in which this point is expressed
 * @returns {Promise<HeightForPosition>} The height for the given coordinate
 */
export const requestHeight = (coordinates, projection) => {
    return new Promise((resolve, reject) => {
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            // this service only functions with LV95 coordinate, so we have to re-project the input to be sure
            // we are giving it LV95 coordinates
            const lv95coords = proj4(projection.epsg, LV95.epsg, coordinates)
            axios
                .get(`${getServiceAltiBaseUrl()}rest/services/height`, {
                    params: {
                        easting: lv95coords[0],
                        northing: lv95coords[1],
                    },
                })
                .then((heightResponse) => {
                    resolve(new HeightForPosition(coordinates, heightResponse.data.height))
                })
                .catch((error) => {
                    log.error('Error while retrieving height for', coordinates, error)
                    reject(error)
                })
        } else {
            const errorMessage = 'Invalid coordinates, no height requested'
            log.error('Invalid coordinates, no height requested', coordinates)
            reject(errorMessage)
        }
    })
}
