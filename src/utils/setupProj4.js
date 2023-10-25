import { LV03, LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import proj4 from 'proj4'

/**
 * Proj4 comes with [EPSG:4326]{@link https://epsg.io/4326} as default projection.
 *
 * By default, this adds the two Swiss projections ([LV95/EPSG:2056]{@link https://epsg.io/2056} and
 * [LV03/EPSG:21781]{@link https://epsg.io/21781}) and metric Web Mercator
 * ([EPSG:3857]{@link https://epsg.io/3857}) definitions to proj4
 *
 * Further projection can be added by settings the param projections (do not forget to include LV95,
 * LV03 and/or WebMercator if you intended to use them too)
 *
 * @param {CoordinateSystem[]} projections
 */
const setupProj4 = (projections = [WEBMERCATOR, LV95, LV03]) => {
    // adding projection defining a transformation matrix to proj4 (these projection matrices can be found on the epsg.io website)
    projections
        .filter((projection) => projection.proj4transformationMatrix)
        .forEach((projection) => {
            try {
                proj4.defs(projection.epsg, projection.proj4transformationMatrix)
            } catch (err) {
                log.error('Error while setting up projection in proj4', projection.epsg, err)
                throw err
            }
        })
}

export default setupProj4
