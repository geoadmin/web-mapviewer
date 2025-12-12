import type { CoordinateSystem, FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'
import type { Coord } from '@turf/turf'
import type {
    Feature,
    FeatureCollection,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
    Position,
} from 'geojson'

import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import {
    bbox,
    booleanPointInPolygon,
    centroid,
    distance,
    point,
    pointToLineDistance,
} from '@turf/turf'
import proj4 from 'proj4'
import { reproject } from 'reproject'

import type { LayerFeature } from '@/api/features.api'

import { reprojectGeoJsonData, transformIntoTurfEquivalent } from '@/utils/geoJsonUtils'

const pixelToleranceForIdentify = 20

function reprojectCoordinates(
    coordinates: Position | Position[] | Position[][] | Position[][][],
    targetProjection: CoordinateSystem
): Position | Position[] | Position[][] | Position[][][] {
    // Check if it's a single Position [x, y] or [x, y, z]
    if (typeof coordinates[0] === 'number') {
        return proj4(WGS84.epsg, targetProjection.epsg, coordinates as Position)
    }

    // Check if it's a Position[][][] (multipolygon coordinates)
    if (
        Array.isArray(coordinates[0]) &&
        Array.isArray(coordinates[0][0]) &&
        Array.isArray(coordinates[0][0][0])
    ) {
        return (coordinates as Position[][][]).map((polygon) =>
            polygon.map((coords) =>
                coords.map((coord) => proj4(WGS84.epsg, targetProjection.epsg, coord))
            )
        )
    }

    // Check if it's a Position[][] (polygon coordinates)
    if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
        return (coordinates as Position[][]).map((coords) =>
            coords.map((coord) => proj4(WGS84.epsg, targetProjection.epsg, coord))
        )
    }

    // Otherwise it's a Position[] (linestring coordinates)
    return (coordinates as Position[]).map((coord) =>
        proj4(WGS84.epsg, targetProjection.epsg, coord)
    )
}

function identifyInGeoJson(
    geoJson: FeatureCollection,
    coordinate: Position,
    projection: CoordinateSystem,
    resolution: number
): Feature[] {
    const features: Feature[] = []
    const distanceThreshold = pixelToleranceForIdentify * resolution
    const coordinateWGS84 = point(proj4(projection.epsg, WGS84.epsg, coordinate))
    const matchingFeatures = geoJson.features
        // only keeping feature with geometry (required to run Turf below)
        .filter(
            (feature): feature is Feature & { geometry: NonNullable<Feature['geometry']> } =>
                feature.geometry !== null && feature.geometry !== undefined
        )
        .filter((feature) => {
            const turfFeature = transformIntoTurfEquivalent(feature.geometry)
            if (!turfFeature || !turfFeature.geometry) {
                return false
            }
            const { geometry } = turfFeature
            // calculating distance with point coordinate, depending on the geometry type
            switch (geometry.type) {
                case 'Polygon':
                case 'MultiPolygon':
                    return booleanPointInPolygon(coordinateWGS84, geometry)
                case 'LineString':
                case 'MultiLineString':
                    return (
                        pointToLineDistance(
                            coordinateWGS84,
                            geometry as Feature<LineString> | LineString,
                            {
                                units: 'meters',
                            }
                        ) <= distanceThreshold
                    )
                case 'Point':
                case 'MultiPoint':
                    return (
                        distance(coordinateWGS84, geometry as Coord, { units: 'meters' }) <=
                        distanceThreshold
                    )
            }
            return false
        })
    if (matchingFeatures?.length > 0) {
        features.push(...matchingFeatures)
    }
    return features
}

/**
 * Finds and returns all features, from the given GeoJSON layer, that are under or close to the
 * given coordinate (we require the map resolution as input, so that we may calculate a 10-pixels
 * tolerance for feature identification)
 *
 * This means we do not require OpenLayers to perform this search anymore, and that this code can be
 * used in any mapping framework.
 *
 * @param geoJsonLayer The GeoJSON layer in which we want to find feature at the given coordinate.
 *   This layer must have its geoJsonData loaded in order for this identification of feature to work
 *   properly (this function will not load the data if it is missing)
 * @param coordinate Where we want to find features ([x, y])
 * @param projection The projection used to describe the coordinate where we want to search for
 *   feature
 * @param resolution The current map resolution, in meters/pixel. Used to calculate a tolerance of
 *   10 pixels around the given coordinate.
 * @returns The feature found at the coordinate, or an empty array if none were found
 */
export function identifyGeoJSONFeatureAt(
    geoJsonLayer: GeoAdminGeoJSONLayer,
    coordinate: Position,
    projection: CoordinateSystem,
    resolution: number
): (LayerFeature | undefined)[] {
    if (!geoJsonLayer?.geoJsonData) {
        log.error('No data for layer', geoJsonLayer, 'no identification of feature possible')
        return []
    }
    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    // to use turf functions, we need to have lat/lon (WGS84) coordinates
    const parsedGeoJsonData = JSON.parse(geoJsonLayer.geoJsonData) as FeatureCollection
    const reprojectedGeoJSON = reprojectGeoJsonData(parsedGeoJsonData, WGS84, projection)
    if (!reprojectedGeoJSON) {
        log.error(
            `Unable to reproject GeoJSON data in order to find features at coordinates`,
            geoJsonLayer,
            coordinate
        )
        return []
    }
    return identifyInGeoJson(reprojectedGeoJSON, coordinate, projection, resolution)
        .filter(
            (
                feature
            ): feature is Feature<
                Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon
            > =>
                feature.geometry !== null &&
                feature.geometry !== undefined &&
                feature.geometry.type !== 'GeometryCollection'
        )
        .map((feature) => {
            const coordinates = reprojectCoordinates(feature.geometry.coordinates, projection)
            const geometry = reproject(feature.geometry, WGS84.epsg, projection.epsg)

            // Create LayerFeature directly since we have a GeoJSON feature, not an OpenLayers feature
            const featureId = feature.id || `feature-${Math.random().toString(36).substr(2, 9)}`

            let featureCoordinates: SingleCoordinate
            // creating a centroid is especially important for Polygon geometries
            if (
                ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)
            ) {
                featureCoordinates = centroid(geometry).geometry.coordinates as SingleCoordinate
            } else {
                featureCoordinates = coordinates as SingleCoordinate
            }

            // Calculate the extent from the geometry
            const featureExtent = bbox(geometry) as FlatExtent

            const layerFeature: LayerFeature = {
                isEditable: false,
                layer: geoJsonLayer,
                id: featureId,
                title:
                    feature.properties?.label ||
                    feature.properties?.name ||
                    feature.properties?.title ||
                    featureId.toString(),
                data: feature.properties || {},
                coordinates: featureCoordinates,
                extent: featureExtent,
                geometry: geometry,
                popupDataCanBeTrusted: false, // GeoJSON layers are external data
            }

            return layerFeature
        })
}
