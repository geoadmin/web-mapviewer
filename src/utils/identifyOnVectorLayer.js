import { LayerFeature } from '@/api/features.api'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import reprojectGeoJsonData from '@/utils/geoJsonUtils'
import log from '@/utils/logging'
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import proj4 from 'proj4'

const pixelToleranceForIdentify = 10

/**
 * @param {GeoAdminGeoJsonLayer} geoJsonLayer
 * @param {[Number, Number]} coordinate
 * @param {CoordinateSystem} projection
 * @param {Number} resolution
 * @returns {LayerFeature[]}
 */
export function identifyGeoJSONFeatureAt(geoJsonLayer, coordinate, projection, resolution) {
    const features = []
    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    const coordinateWGS84 = point(proj4(projection.epsg, WGS84.epsg, coordinate))
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
    const matchingFeatures = reprojectedGeoJSON.features
        .filter((feature) => {
            const distanceWithClick = distance(
                coordinateWGS84,
                point(feature.geometry.coordinates),
                {
                    units: 'meters',
                }
            )
            return distanceWithClick <= pixelToleranceForIdentify * resolution
        })
        .map((feature) => {
            // back to the starting projection
            feature.geometry.coordinates = proj4(
                WGS84.epsg,
                projection.epsg,
                feature.geometry.coordinates
            )
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
                proj4(WGS84.epsg, projection.epsg, feature.geometry.coordinates),
                null,
                feature.geometry
            )
        })
    if (matchingFeatures?.length > 0) {
        features.push(...matchingFeatures)
    }
    return features
}

/**
 * @param {KMLLayer} _kmlLayer
 * @param {[Number, Number]} _coordinate
 * @param {CoordinateSystem} _projection
 * @param {Number} _resolution
 * @returns {LayerFeature[]}
 */
export function identifyKMLFeatureAt(_kmlLayer, _coordinate, _projection, _resolution) {
    // TODO : implement KML layer feature identification
    return []
}
