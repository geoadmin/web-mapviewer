import { API_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'
import EventEmitter from '@/utils/EventEmitter.class'

/**
 * Representation of a feature that can be selected by the user on the map. This feature can be
 * edited if the corresponding flag says so (it will then fires "change" events any time one
 * property of the instance has changed)
 *
 * This will then be specialized in (at least) two flavor of features, layer feature (coming from
 * our backend, with extra information attached) and drawing feature (that can be modified by the user)
 *
 * @abstract
 */
export class Feature extends EventEmitter {
    /**
     * @param {String | Number} id Unique identifier for this feature (unique in the context it
     *   comes from, not for the whole app)
     * @param {Number[]} coordinate [x,y] coordinates of this feature in EPSG:3857 (metric mercator)
     * @param {String} title Title of this feature
     * @param {String} description A description of this feature, can not be HTML content (only text)
     * @param {Boolean} isEditable Whether this feature is editable when selected (color, size, etc...)
     */
    constructor(id, coordinate, title, description, isEditable) {
        super()
        this._id = id
        this._coordinate = [...coordinate]
        this._title = title
        this._description = description
        this._isEditable = !!isEditable
    }

    emitChangeEvent() {
        this.emit('change', this)
    }

    get id() {
        return this._id
    }
    // ID is immutable, no setter

    get coordinate() {
        return this._coordinate
    }
    set coordinate(newCoordinate) {
        if (Array.isArray(newCoordinate) && newCoordinate.length === 2) {
            this._coordinate = newCoordinate
            this.emitChangeEvent()
        }
    }

    get title() {
        return this._title
    }
    set title(newTitle) {
        this._title = newTitle
        this.emitChangeEvent()
    }

    get description() {
        return this._description
    }
    set description(newDescription) {
        this._description = newDescription
        this.emitChangeEvent()
    }

    get isEditable() {
        return this._isEditable
    }
    // isEditable is immutable, no setter
}

export class EditableFeature extends Feature {
    /**
     * @param {String | Number} id Unique identifier for this feature (unique in the context it
     *   comes from, not for the whole app)
     * @param {Number[]} coordinate [x,y] coordinates of this feature in EPSG:3857 (metric mercator)
     * @param {String} title Title of this feature
     * @param {String} description A description of this feature, can not be HTML content (only text)
     */
    constructor(id, coordinate, title, description) {
        super(id, coordinate, title, description, true)
    }
}

/** Describe a feature from the backend (see {@link getFeature}) below */
export class LayerFeature extends Feature {
    /**
     * @param {GeoAdminLayer} layer The layer in which this feature belongs
     * @param {Number | String} id The unique feature ID in the layer it is part of
     * @param {String} htmlPopup HTML code for this feature's popup (or tooltip)
     * @param {Number[]} coordinate [x,y] coordinate in EPSG:3857
     * @param {Number[]} extent Extent of the feature expressed with two point, bottom left and top
     *   right, in EPSG:3857
     * @param {Object} geometry GeoJSON geometry (if exists)
     */
    constructor(layer, id, htmlPopup, coordinate, extent, geometry = null) {
        super(id, coordinate, null, null, false)
        this.layer = layer
        // for now the backend gives us the description of the feature as HTML
        // it would be good to change that to only data in the future
        this.htmlPopup = htmlPopup
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
 * @param {GeoAdminLayer} layer
 * @param {Number[]} coordinate Coordinate where to identify feature in EPSG:3857
 * @param {Number[]} mapExtent
 * @param {Number} screenWidth
 * @param {Number} screenHeight
 * @param {String} lang
 * @returns {Promise<LayerFeature[]>}
 */
export const identify = (layer, coordinate, mapExtent, screenWidth, screenHeight, lang) => {
    return new Promise((resolve, reject) => {
        if (!layer || !layer.getID()) {
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
                        layers: `all:${layer.getID()}`,
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
 * @param {String} lang The language for the HTML popup
 * @returns {Promise<LayerFeature>}
 */
const getFeature = (layer, featureID, lang = 'en') => {
    return new Promise((resolve, reject) => {
        if (!layer || !layer.getID()) {
            reject('Needs a valid layer with an ID')
        }
        if (!featureID) {
            reject('Needs a valid feature ID')
        }
        // combining the two requests in one promise
        const topic = layer.getTopicForIdentifyAndTooltipRequests()
        const featureUrl = `${API_BASE_URL}rest/services/${topic}/MapServer/${layer.getID()}/${featureID}`
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
                    new LayerFeature(
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
                log(
                    'error',
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
