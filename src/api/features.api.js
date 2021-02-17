import { API_BASE_URL } from '@/config'
import axios from 'axios'

/** Describe a feature from the backend (see {@link getFeature}) below */
export class Feature {
    /**
     * @param {WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer} layer The layer in which this
     *   feature belongs
     * @param {Number | String} id The unique feature ID in the layer it is part of
     * @param {String} htmlPopup HTML code for this feature's popup (or tooltip)
     * @param {Number[]} coordinate [x,y] coordinate in EPSG:3857
     * @param {Number[]} extent Extent of the feature expressed with two point, bottom left and top
     *   right, in EPSG:3857
     * @param {Object} geometry GeoJSON geometry (if exists)
     */
    constructor(layer, id, htmlPopup, coordinate, extent, geometry = null) {
        this.layer = layer
        this.id = id
        this.htmlPopup = htmlPopup
        this.coordinate = coordinate
        this.extent = extent
        this.geometry = geometry
    }

    /** @returns {LayerTypes} */
    getLayerType() {
        return this.layer && this.layer.type
    }
}

/**
 * Asks the backend for identification of features at the coordinates for the given layer using
 * http://api3.geo.admin.ch/services/sdiservices.html#identify-features
 *
 * @param {WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer} layer
 * @param {Number[]} coordinate Coordinate where to identify feature in EPSG:3857
 * @param {Number[]} mapExtent
 * @param {Number} screenWidth
 * @param {Number} screenHeight
 * @param {String} lang
 * @returns {Promise<Feature[]>}
 */
export const identify = (layer, coordinate, mapExtent, screenWidth, screenHeight, lang) => {
    return new Promise((resolve, reject) => {
        if (!layer || !layer.id) {
            console.error('Invalid layer', layer)
            reject('Needs a valid layer with an ID')
        }
        if (!Array.isArray(coordinate) || coordinate.length !== 2) {
            console.error('Invalid coordinate', coordinate)
            reject('Needs a valid coordinate to run identification')
        }
        if (!Array.isArray(mapExtent) || mapExtent.length !== 4) {
            console.error('Invalid extent', mapExtent)
            reject('Needs a valid map extent to run identification')
        }
        if (screenWidth <= 0 || screenHeight <= 0) {
            console.error('Invalid screen size', screenWidth, screenHeight)
            reject('Needs valid screen width and height to run identification')
        }
        axios
            .get(
                `${API_BASE_URL}rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/identify`,
                {
                    params: {
                        layers: `all:${layer.id}`,
                        sr: 3857, // EPSG:3857
                        geometry: coordinate.join(','),
                        geometryFormat: 'geojson',
                        geometryType: 'esriGeometryPoint',
                        imageDisplay: `${screenWidth},${screenHeight},96`,
                        mapExtent: mapExtent.join(','),
                        limit: 10,
                        tolerance: 10,
                        returnGeometry: true,
                        lang: lang,
                    },
                }
            )
            .then((response) => {
                const featureRequests = []
                if (response.data && response.data.results && response.data.results.length > 0) {
                    // for each feature that has been identify, we will now load their metadata and tooltip content
                    response.data.results.forEach((feature) => {
                        featureRequests.push(getFeature(layer, feature.id, lang))
                    })
                    Promise.all(featureRequests)
                        .then((values) => {
                            console.debug('feature received', values)
                            resolve(values)
                        })
                        .catch((error) => {
                            console.error("Wasn't able to get feature", error)
                        })
                } else {
                    resolve([])
                }
            })
    })
}

/**
 * Loads a feature metadata and tooltip content from this two endpoint of the backend
 * - http://api3.geo.admin.ch/services/sdiservices.html#identify-features
 * - http://api3.geo.admin.ch/services/sdiservices.html#htmlpopup-resource
 *
 * @param {WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer} layer The layer from which the
 *   feature is part of
 * @param {String | Number} featureID The feature ID in the BGDI
 * @param {String} lang The language for the HTML popup
 * @returns {Promise<Feature>}
 */
const getFeature = (layer, featureID, lang = 'en') => {
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
                        sr: 3857,
                        geometryFormat: 'geojson',
                    },
                }),
                axios.get(`${featureUrl}/htmlPopup`, {
                    params: {
                        sr: 3857,
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
                const featureExtent = []
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
                resolve(
                    new Feature(
                        layer,
                        featureID,
                        featureHtmlPopup,
                        featureCoordinate,
                        featureExtent,
                        featureGeoJSONGeometry
                    )
                )
            })
            .catch((error) => {
                console.error(
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
