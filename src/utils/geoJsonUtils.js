import { reproject } from 'reproject'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

/**
 * Re-projecting the GeoJSON if not in the wanted projection
 *
 * The default projection for GeoJSON is WGS84 as stated in the reference
 * https://tools.ietf.org/html/rfc7946#section-4
 *
 * If another projection was set in the GeoJSON (through the "crs" property), it should be given as
 * `fromProjection`
 *
 * @param {Object} geoJsonData Data to be reprojected
 * @param {CoordinateSystem} toProjection Wanted projection for these data
 * @param {CoordinateSystem} fromProjection Source projection, in which the data is currently being
 *   described (or `null` if none were set in the GeoJSON data, meaning it is described with WGS84)
 */
export default function reprojectGeoJsonData(geoJsonData, toProjection, fromProjection = null) {
    let reprojectedGeoJSON
    if (fromProjection instanceof CoordinateSystem && toProjection instanceof CoordinateSystem) {
        if (fromProjection.epsg !== toProjection.epsg) {
            reprojectedGeoJSON = reproject(geoJsonData, fromProjection.epsg, toProjection.epsg)
        } else {
            // it's already in the correct projection, we don't re-project
            reprojectedGeoJSON = geoJsonData
        }
    } else if (toProjection instanceof CoordinateSystem) {
        // according to the IETF reference, if nothing is said about the projection used, it should be WGS84
        reprojectedGeoJSON = reproject(geoJsonData, WGS84.epsg, toProjection.epsg)
    }
    return reprojectedGeoJSON
}
