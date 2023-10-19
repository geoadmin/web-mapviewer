import { LV03, LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { get as getProjection } from 'ol/proj'
import { register } from 'ol/proj/proj4'
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
    // registering all "custom" projection with OpenLayers as well
    register(proj4)
    // setting the boundaries for projection, in the OpenLayers context, whenever bounds are defined
    // this will help OpenLayers know when tiles shouldn't be requested because coordinates are out of bounds
    projections
        .filter((projection) => projection.bounds)
        .forEach((projection) => {
            const olProjection = getProjection(projection.epsg)
            olProjection?.setExtent(projection.bounds.flatten)
        })
}

export default setupProj4
