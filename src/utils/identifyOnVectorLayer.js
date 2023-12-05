import { kml as toGeoJSON } from '@mapbox/togeojson'
import distance from '@turf/distance'
import { lineString, point } from '@turf/helpers'
import pointToLineDistance from '@turf/point-to-line-distance'
import proj4 from 'proj4'

import { EditableFeature, LayerFeature } from '@/api/features.api'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import reprojectGeoJsonData from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

const pixelToleranceForIdentify = 10

function identifyInGeoJson(geoJson, coordinate, projection, resolution) {
    const features = []
    const coordinateWGS84 = point(proj4(projection.epsg, WGS84.epsg, coordinate))
    const matchingFeatures = geoJson.features.filter((feature) => {
        let distanceWithClick
        // we have a polygon here
        if (Array.isArray(feature.geometry.coordinates[0])) {
            distanceWithClick = pointToLineDistance(
                coordinateWGS84,
                lineString(feature.geometry.coordinates),
                {
                    units: 'meters',
                }
            )
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
                `<div class="htmlpopup-container">
                               <div class="htmlpopup-header">
                                   <span>${geoJsonLayer.name}</span>
                               </div>
                               <div class="htmlpopup-content">
                                   ${feature.properties.description}
                               </div>
                           </div>`,
                // back to the starting projection
                proj4(WGS84.epsg, projection.epsg, feature.geometry.coordinates),
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
        const convertedKml = toGeoJSON(parseKml)
        return identifyInGeoJson(convertedKml, coordinate, projection, resolution).map(
            (feature) => {
                let reprojectedCoordinates
                if (Array.isArray(feature.geometry.coordinates[0])) {
                    reprojectedCoordinates = feature.geometry.coordinates.map((coord) =>
                        proj4(WGS84.epsg, projection.epsg, coord)
                    )
                } else {
                    reprojectedCoordinates = proj4(
                        WGS84.epsg,
                        projection.epsg,
                        feature.geometry.coordinates
                    )
                }
                if (feature.properties.editableFeature) {
                    return EditableFeature.deserialize(
                        feature.properties.editableFeature,
                        reprojectedCoordinates
                    )
                }
            }
        )
    }
    return []
}
