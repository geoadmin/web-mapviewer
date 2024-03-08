import bbox from '@turf/bbox'
import {
    featureCollection,
    lineString,
    multiLineString,
    multiPoint,
    multiPolygon,
    point,
    polygon,
} from '@turf/helpers'
import { reproject } from 'reproject'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

import { normalizeExtent } from './coordinates/coordinateUtils'

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
export function reprojectGeoJsonData(geoJsonData, toProjection, fromProjection = null) {
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

/**
 * Transforms some GeoJSON feature/data into the TurfJS equivalent. This might be useful when we
 * want to compute distance or similar things with turf, but we do not know what kind of GeoJSON
 * geometry type we are dealing with.
 *
 * @param geoJsonData
 * @param {CoordinateSystem} fromProjection In which coordinate-system is this GeoJSON data
 *   described as. If nothing is specified, the default projection of GeoJSON data must be WGS84.
 * @returns {Feature<MultiPoint, Properties>
 *     | Feature<LineString, Properties>
 *     | Feature<MultiLineString, Properties>
 *     | Feature<MultiPolygon, Properties>
 *     | null
 *     | Feature<Point, Properties>
 *     | Feature<Polygon, Properties>}
 */
export function transformIntoTurfEquivalent(geoJsonData, fromProjection = WGS84) {
    const geometryWGS84 = reprojectGeoJsonData(geoJsonData, WGS84, fromProjection)
    switch (geometryWGS84.type) {
        case 'Point':
            return point(geometryWGS84.coordinates)
        case 'MultiPoint':
            return multiPoint(geometryWGS84.coordinates)
        case 'LineString':
            return lineString(geometryWGS84.coordinates)
        case 'MultiLineString':
            return multiLineString(geometryWGS84.coordinates)
        case 'Polygon':
            return polygon(geometryWGS84.coordinates)
        case 'MultiPolygon':
            return multiPolygon(geometryWGS84.coordinates)
    }
    log.error('Unknown geometry type', geometryWGS84.type)
    return null
}

/**
 * @param {Object[]} geometries An array of all geometries in features.
 * @returns An extent which covers all geometries given as parameter
 */
export function getExtentOfGeometries(geometries) {
    return normalizeExtent(
        bbox(featureCollection(geometries.map((geometry) => transformIntoTurfEquivalent(geometry))))
    )
}
