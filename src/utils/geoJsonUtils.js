import bbox from '@turf/bbox'
import centroid from '@turf/centroid'
import {
    featureCollection,
    lineString,
    multiLineString,
    multiPoint,
    multiPolygon,
    point,
    polygon,
} from '@turf/helpers'
import proj4 from 'proj4'
import { reproject } from 'reproject'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { normalizeExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

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
 * @param {Object} geoJsonFeature Some GeoJSON feature
 * @param {CoordinateSystem} inputProjection Source projection (in which the GeoJSON feature is
 *   described as)
 * @param {CoordinateSystem} outputProjection Wanted output projection, if different thant the input
 *   projection reprojection will be automatically applied before returning the coordinates
 * @returns {[[Number, Number]]} Coordinates of this GeoJSON feature (if it's a point, it will still
 *   be wrapped in an array)
 */
export function getGeoJsonFeatureCoordinates(geoJsonFeature, inputProjection, outputProjection) {
    let featureCoordinate = []
    // if GeoJSON type is Point, we grab the coordinates
    if (geoJsonFeature.type === 'Point') {
        featureCoordinate = geoJsonFeature.coordinates
    } else if (geoJsonFeature.type === 'MultiPoint' && geoJsonFeature.coordinates.length === 1) {
        // or if the GeoJSON type is MultiPoint, but there's only one point in the array, we grab it
        featureCoordinate = geoJsonFeature.coordinates[0]
    } else {
        // this feature has a geometry more complex that a single point, we calculate its centroid as single coordinate
        featureCoordinate = centroid(geoJsonFeature)
    }

    if (outputProjection.epsg !== inputProjection.epsg) {
        featureCoordinate = proj4(inputProjection.epsg, outputProjection.epsg, featureCoordinate)
    }
    return featureCoordinate
}

/**
 * @param {Object[]} geometries An array of all geometries in features.
 * @returns {[[Number, Number], [Number, Number]]} An extent which covers all geometries given as
 *   parameter
 */
export function getExtentOfGeometries(geometries) {
    return normalizeExtent(
        bbox(featureCollection(geometries.map((geometry) => transformIntoTurfEquivalent(geometry))))
    )
}
