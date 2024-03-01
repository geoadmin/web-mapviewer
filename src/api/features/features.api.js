import axios from 'axios'
import proj4 from 'proj4'

import LayerFeature from '@/api/features/LayerFeature.class.js'
import { API_BASE_URL } from '@/config.js'
import { LV95 } from '@/utils/coordinates/coordinateSystems.js'
import { projExtent } from '@/utils/coordinates/coordinateUtils.js'
import log from '@/utils/logging.js'

/**
 * Extract OL feature coordinates in format that we support in our application
 *
 * @param {Feature} feature Openlayer kml feature
 * @returns {[[lat, lon]]} Return the coordinate of the feature
 */
export function extractOlFeatureCoordinates(feature) {
    let coordinates = feature.getGeometry().getCoordinates()
    switch (feature.getGeometry().getType()) {
        case 'Polygon':
            // in the case of a polygon, the coordinates structure is
            // [
            //   [ (poly1)
            //      [coord1],[coord2]
            //   ],
            //   [ (poly2) ...
            // ]
            // so as we will not have multipoly, we only keep what's defined as poly one
            // (we remove the wrapping array that would enable us to have a second polygon)
            coordinates = coordinates[0]
            break
        case 'Point':
            // we ensure the coordinates are wrapped ([ [x,y] ]
            if (!Array.isArray(coordinates[0])) {
                coordinates = [coordinates]
            }
            break
    }
    return coordinates
}

/**
 * Extract geodesic coordinates from OL feature
 *
 * @param {Feature} feature OL feature
 * @returns {[[lat, lon]]} Return the geodesic coordinate of the feature
 */
export function extractOlFeatureGeodesicCoordinates(feature) {
    return feature.get('geodesic')?.getGeodesicGeom().getCoordinates()[0]
}

/**
 * Calculate the extent which encompass all features in an array
 *
 * @param {Features[]} features An Array of features
 * @returns {[[lat, lon], [lat, lon]]} Return the extent which encompass all features
 */
export function getExtentOfFeatures(features) {
    const coordinatesX = []
    const coordinatesY = []
    features.forEach((feature) => {
        coordinatesX.push(feature.coordinates[0][0])
        coordinatesY.push(feature.coordinates[0][1])
    })
    const extent = [
        [Math.min(...coordinatesX), Math.min(...coordinatesY)],
        [Math.max(...coordinatesX), Math.max(...coordinatesY)],
    ]
    return extent
}

/**
 * Asks the backend for identification of features at the coordinates for the given layer using
 * http://api3.geo.admin.ch/services/sdiservices.html#identify-features
 *
 * @param {GeoAdminLayer} layer
 * @param {Number[]} coordinate Coordinate where to identify feature in EPSG:3857
 * @param {Number[]} mapExtent
 * @param {Number} screenWidth
 * @param {Number} screenHeight
 * @param {String} lang
 * @param {CoordinateSystem} projection Projection in which the coordinates of the features should
 *   be expressed
 * @returns {Promise<LayerFeature[]>}
 */
export const identify = (
    layer,
    coordinate,
    mapExtent,
    screenWidth,
    screenHeight,
    lang,
    projection
) => {
    return new Promise((resolve, reject) => {
        if (!layer || !layer.id) {
            log.error('Invalid layer', layer)
            reject('Needs a valid layer with an ID')
        }
        if (!Array.isArray(coordinate) || coordinate.length !== 2) {
            log.error('Invalid coordinate', coordinate)
            reject('Needs a valid coordinate to run identification')
        }
        if (!Array.isArray(mapExtent) || mapExtent.length !== 4) {
            log.error('Invalid extent', mapExtent)
            reject('Needs a valid map extent to run identification')
        }
        if (screenWidth <= 0 || screenHeight <= 0) {
            log.error('Invalid screen size', screenWidth, screenHeight)
            reject('Needs valid screen width and height to run identification')
        }
        axios
            .get(
                `${API_BASE_URL}rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/identify`,
                {
                    params: {
                        layers: `all:${layer.id}`,
                        sr: projection.epsgNumber,
                        geometry: coordinate.join(','),
                        geometryFormat: 'geojson',
                        geometryType: 'esriGeometryPoint',
                        imageDisplay: `${screenWidth},${screenHeight},96`,
                        mapExtent: mapExtent.join(','),
                        limit: 10,
                        tolerance: 10,
                        returnGeometry: true,
                        lang: lang,
                        timeInstant: layer.timeConfig?.currentYear ?? null,
                    },
                }
            )
            .then((response) => {
                const featureRequests = []
                if (response.data && response.data.results && response.data.results.length > 0) {
                    // for each feature that has been identify, we will now load their metadata and tooltip content
                    response.data.results.forEach((feature) => {
                        featureRequests.push(getFeature(layer, feature.id, projection, lang))
                    })
                    Promise.all(featureRequests)
                        .then((values) => {
                            resolve(values)
                        })
                        .catch((error) => {
                            log.error("Wasn't able to get feature", error)
                        })
                } else {
                    resolve([])
                }
            })
    })
}

/**
 * Loads a feature metadata and tooltip content from this two endpoint of the backend
 *
 * - http://api3.geo.admin.ch/services/sdiservices.html#identify-features
 * - http://api3.geo.admin.ch/services/sdiservices.html#htmlpopup-resource
 *
 * @param {GeoAdminLayer} layer The layer from which the feature is part of
 * @param {String | Number} featureID The feature ID in the BGDI
 * @param {CoordinateSystem} outputProjection Projection in which the coordinates (and possible
 *   extent) of the features should be expressed
 * @param {String} lang The language for the HTML popup
 * @returns {Promise<LayerFeature>}
 */
const getFeature = (layer, featureID, outputProjection, lang = 'en') => {
    return new Promise((resolve, reject) => {
        if (!layer || !layer.id) {
            reject('Needs a valid layer with an ID')
        }
        if (!featureID) {
            reject('Needs a valid feature ID')
        }
        // combining the two requests in one promise
        const topic = layer.getTopicForIdentifyAndTooltipRequests()
        const featureUrl = `${API_BASE_URL}rest/services/${topic}/MapServer/${layer.id}/${featureID}`
        axios
            .all([
                axios.get(featureUrl, {
                    params: {
                        sr: LV95.epsgNumber,
                        geometryFormat: 'geojson',
                    },
                }),
                axios.get(`${featureUrl}/htmlPopup`, {
                    params: {
                        sr: LV95.epsgNumber,
                        lang: lang,
                    },
                }),
            ])
            .then((responses) => {
                const featureMetadata = responses[0].data.feature
                    ? responses[0].data.feature
                    : responses[0].data
                const featureHtmlPopup = responses[1].data
                const featureGeoJSONGeometry = featureMetadata.geometry
                let featureExtent = []
                if (featureMetadata.bbox) {
                    featureExtent.push(...featureMetadata.bbox)
                }

                let featureCoordinate = []
                // if GeoJSON type is Point, we grab the coordinates
                if (featureGeoJSONGeometry.type === 'Point') {
                    featureCoordinate = featureGeoJSONGeometry.coordinates
                } else if (
                    featureGeoJSONGeometry.type === 'MultiPoint' &&
                    featureGeoJSONGeometry.coordinates.length === 1
                ) {
                    // or if the GeoJSON type is MultiPoint, but there's only one point in the array, we grab it
                    featureCoordinate = featureGeoJSONGeometry.coordinates[0]
                } else {
                    // this feature has a geometry more complicated that a single point, we store the center of the extent as the coordinate
                    featureCoordinate = [
                        (featureMetadata.bbox[0] + featureMetadata.bbox[2]) / 2,
                        (featureMetadata.bbox[1] + featureMetadata.bbox[3]) / 2,
                    ]
                }
                const featureName = featureMetadata?.properties?.name

                if (outputProjection.epsg !== LV95.epsg) {
                    featureCoordinate = proj4(LV95.epsg, outputProjection.epsg, featureCoordinate)
                    if (featureExtent.length === 4) {
                        featureExtent = projExtent(LV95, outputProjection, featureExtent)
                    }
                }

                resolve(
                    new LayerFeature(
                        layer,
                        featureID,
                        featureName,
                        featureHtmlPopup,
                        featureCoordinate,
                        featureExtent,
                        featureGeoJSONGeometry
                    )
                )
            })
            .catch((error) => {
                log.error(
                    'Error while requesting a feature to the backend',
                    layer,
                    featureID,
                    error
                )
                reject(error)
            })
    })
}

export default getFeature
