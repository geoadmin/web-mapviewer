import log from '@geoadmin/log'

import type CoordinateSystem from '@/proj/CoordinateSystem'

import { LV03, LV95, WEBMERCATOR } from '@/proj'

/**
 * Proj4 comes with [EPSG:4326]{@link https://epsg.io/4326} as default projection.
 *
 * By default, this adds the two Swiss projections ([LV95/EPSG:2056]{@link https://epsg.io/2056} and
 * [LV03/EPSG:21781]{@link https://epsg.io/21781}) and metric Web Mercator
 * ([EPSG:3857]{@link https://epsg.io/3857}) definitions to proj4
 *
 * Further projection can be added by settings the param projections (do not forget to include LV95,
 * LV03 and/or WebMercator if you intended to use them too)
 */
const registerProj4 = (
    proj4: typeof import('proj4'),
    projections: CoordinateSystem[] = [WEBMERCATOR, LV95, LV03]
): void => {
    // adding projection defining a transformation matrix to proj4 (these projection matrices can be found on the epsg.io website)
    projections
        .filter((projection) => projection.proj4transformationMatrix)
        .forEach((projection) => {
            try {
                proj4.defs(projection.epsg, projection.proj4transformationMatrix)
            } catch (err) {
                const error = err ? (err as Error) : new Error('Unknown error')
                log.error('Error while setting up projection in proj4', projection.epsg, error)
                throw error
            }
        })
}

export { registerProj4 }
export default registerProj4
