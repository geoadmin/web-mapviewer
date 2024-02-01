import { gpx as gpxToGeoJSON, kml as kmlToGeoJSON } from '@mapbox/togeojson'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import distance from '@turf/distance'
import { lineString, point, polygon } from '@turf/helpers'
import pointToLineDistance from '@turf/point-to-line-distance'
import proj4 from 'proj4'

import { EditableFeature, LayerFeature } from '@/api/features.api'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import reprojectGeoJsonData from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

const pixelToleranceForIdentify = 10

function generateHtmlPopup(layerName, featureDescription, extraInformation = null) {
    let popup = `<div class="htmlpopup-container">`
    if (layerName) {
        popup += `<div class="htmlpopup-header">${layerName}</div>`
    }
    if (featureDescription) {
        popup += `<div class="htmlpopup-content">${featureDescription}`
        if (extraInformation) {
            popup += `<div>${extraInformation}</div>`
        }
        popup += '</div>'
    }
    popup += `</div>`
    return popup
}

/**
 * @param {Array} coordinates
 * @param {CoordinateSystem} targetProjection
 * @returns {Array}
 */
function reprojectCoordinates(coordinates, targetProjection) {
    let reprojectedCoordinates
    if (Array.isArray(coordinates[0])) {
        // closed polygons are expressed as a double-wrapped array
        if (Array.isArray(coordinates[0][0])) {
            reprojectedCoordinates = coordinates[0].map((coord) =>
                proj4(WGS84.epsg, targetProjection.epsg, coord)
            )
        } else {
            reprojectedCoordinates = coordinates.map((coord) =>
                proj4(WGS84.epsg, targetProjection.epsg, coord)
            )
        }
    } else {
        reprojectedCoordinates = proj4(WGS84.epsg, targetProjection.epsg, coordinates)
    }
    return reprojectedCoordinates
}

function identifyInGeoJson(geoJson, coordinate, projection, resolution) {
    const features = []
    const coordinateWGS84 = point(proj4(projection.epsg, WGS84.epsg, coordinate))
    const matchingFeatures = geoJson.features.filter((feature) => {
        let distanceWithClick
        // we have a polygon or a line here
        if (Array.isArray(feature.geometry.coordinates[0])) {
            // if it is a polygon, we have to check its area against the coordinate
            // polygons are expressed as a double-wrapped array of coordinates
            if (Array.isArray(feature.geometry.coordinates[0][0])) {
                if (booleanPointInPolygon(coordinateWGS84, polygon(feature.geometry.coordinates))) {
                    distanceWithClick = 0
                } else {
                    // if not within the polygon area, we still need to check the distance with its border
                    distanceWithClick = pointToLineDistance(
                        coordinateWGS84,
                        lineString(feature.geometry.coordinates[0]),
                        {
                            units: 'meters',
                        }
                    )
                }
            } else {
                // we are dealing with line, no need to unpack the coordinates
                distanceWithClick = pointToLineDistance(
                    coordinateWGS84,
                    lineString(feature.geometry.coordinates),
                    {
                        units: 'meters',
                    }
                )
            }
        } else {
            distanceWithClick = distance(coordinateWGS84, point(feature.geometry.coordinates), {
                units: 'meters',
            })
        }
        return distanceWithClick <= pixelToleranceForIdentify * resolution
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
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer The GeoJSON layer in which we want to find feature at
 *   the given coordinate. This layer must have its geoJsonData loaded in order for this
 *   identification of feature to work properly (this function will not load the data if it is
 *   missing)
 * @param {[Number, Number]} coordinate Where we want to find features ([x, y])
 * @param {CoordinateSystem} projection The projection used to describe the coordinate where we want
 *   to search for feature
 * @param {Number} resolution The current map resolution, in meters/pixel. Used to calculate a
 *   tolerance of 10 pixels around the given coordinate.
 * @returns {SelectableFeature[]} The feature found at the coordinate, or an empty array if none
 *   were found
 */
export function identifyGeoJSONFeatureAt(geoJsonLayer, coordinate, projection, resolution) {
    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    // to use turf functions, we need to have lat/lon (WGS84) coordinates
    const reprojectedGeoJSON = reprojectGeoJsonData(geoJsonLayer.geoJsonData, WGS84, projection)
    if (!reprojectedGeoJSON) {
        log.error(
            `Unable to reproject GeoJSON data in order to find features at coordinates`,
            geoJsonLayer.getID(),
            coordinate
        )
        return []
    }
    return identifyInGeoJson(reprojectedGeoJSON, coordinate, projection, resolution).map(
        (feature) => {
            return new LayerFeature(
                geoJsonLayer,
                feature.id,
                feature.properties.station_name || feature.id,
                generateHtmlPopup(geoJsonLayer.name, feature.properties.description),
                reprojectCoordinates(feature.geometry.coordinates, projection),
                null,
                feature.geometry
            )
        }
    )
}

/**
 * Finds and returns all features, from the given KML layer, that are under or close to the given
 * coordinate (we require the map resolution as input, so that we may calculate a 10-pixels
 * tolerance for feature identification)
 *
 * This means we do not require OpenLayers to perform this search anymore, and that this code can be
 * used in any mapping framework.
 *
 * @param {KMLLayer} kmlLayer The KML layer in which we want to find feature at the given
 *   coordinate. This layer must have its kmlData loaded in order for this identification of feature
 *   to work properly (this function will not load the data if it is missing)
 * @param {[Number, Number]} coordinate Where we want to find features ([x, y])
 * @param {CoordinateSystem} projection The projection used to describe the coordinate where we want
 *   to search for feature
 * @param {Number} resolution The current map resolution, in meters/pixel. Used to calculate a
 *   tolerance of 10 pixels around the given coordinate.
 * @returns {SelectableFeature[]} The feature found at the coordinate, or an empty array if none
 *   were found
 */
export function identifyKMLFeatureAt(kmlLayer, coordinate, projection, resolution) {
    if (kmlLayer?.kmlData) {
        const parseKml = new DOMParser().parseFromString(kmlLayer.kmlData, 'text/xml')
        const convertedKml = kmlToGeoJSON(parseKml)
        return identifyInGeoJson(convertedKml, coordinate, projection, resolution).map(
            (feature) => {
                // TODO use a new generic feature for identify (same for external KML and GPX) and not the editable
                return EditableFeature.newFeature({
                    id: feature.id,
                    coordinates: reprojectCoordinates(feature.geometry.coordinates, projection),
                    title: feature.properties.name,
                    description: feature.properties.description,
                    featureType: feature.properties.type.toUpperCase(),
                })
            }
        )
    }
    return []
}

/**
 * @param {GPXLayer} gpxLayer
 * @param {[Number, Number]} coordinate Where we want to find features ([x, y])
 * @param {CoordinateSystem} projection The projection used to describe the coordinate where we want
 *   to search for feature
 * @param {Number} resolution The current map resolution, in meters/pixel. Used to calculate a
 *   tolerance of 10 pixels around the given coordinate.
 * @returns {SelectableFeature[]} The feature found at the coordinate, or an empty array if none
 *   were found
 */
export function identifyGPXFeatureAt(gpxLayer, coordinate, projection, resolution) {
    if (gpxLayer?.gpxData) {
        const parseGpx = new DOMParser().parseFromString(gpxLayer.gpxData, 'text/xml')
        const convertedGpx = gpxToGeoJSON(parseGpx)
        return identifyInGeoJson(convertedGpx, coordinate, projection, resolution).map(
            (feature) => {
                const reprojectedCoordinates = reprojectCoordinates(
                    feature.geometry.coordinates,
                    projection
                )
                const reprojectedGeometry = {
                    type: feature.geometry.type,
                    coordinates: reprojectedCoordinates,
                }
                return new LayerFeature(
                    gpxLayer,
                    `${gpxLayer.name}-${feature.properties?.name}`,
                    feature.properties?.name,
                    generateHtmlPopup(
                        gpxLayer.name,
                        feature.properties?.name || gpxLayer.gpxMetadata?.description,
                        feature.properties?.type ? `Type: ${feature.properties.type}` : null
                    ),
                    reprojectedCoordinates,
                    null,
                    reprojectedGeometry
                )
            }
        )
    }
    return []
}
