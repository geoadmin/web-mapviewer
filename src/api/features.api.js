import { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import { API_BASE_URL } from '@/config'
import { featureStyleFunction } from '@/modules/drawing/lib/style'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import EventEmitter from '@/utils/EventEmitter.class'
import {
    allStylingColors,
    allStylingSizes,
    FeatureStyleColor,
    FeatureStyleSize,
    MEDIUM,
    RED,
} from '@/utils/featureStyleUtils'
import { GeodesicGeometries } from '@/utils/geodesicManager'
import { getEditableFeatureFromLegacyKmlFeature } from '@/utils/legacyKmlUtils'
import log from '@/utils/logging'
import axios from 'axios'
import { Icon as openlayersIcon } from 'ol/style'
import {
    extractOlFeatureCoordinates,
    extractOlFeatureGeodesicCoordinates,
} from '@/modules/drawing/lib/drawingUtils'

/**
 * Representation of a feature that can be selected by the user on the map. This feature can be
 * edited if the corresponding flag says so (it will then fire "change" events any time one property
 * of the instance has changed)
 *
 * This will then be specialized in (at least) two flavor of features, layer feature (coming from
 * our backend, with extra information attached) and drawing feature (that can be modified by the
 * user)
 *
 * @abstract
 */
export class SelectableFeature extends EventEmitter {
    /**
     * @param {String | Number} id Unique identifier for this feature (unique in the context it
     *   comes from, not for the whole app)
     * @param {Number[][]} coordinates [[x,y],[x2,y2],...] coordinates of this feature
     * @param {String} title Title of this feature
     * @param {String} description A description of this feature, can not be HTML content (only
     *   text)
     * @param {Boolean} isEditable Whether this feature is editable when selected (color, size,
     *   etc...)
     */
    constructor(id, coordinates, title, description, isEditable = false) {
        super()
        this._id = id
        // using the setter for coordinate (see below)
        this.coordinates = coordinates
        this.title = title
        this.description = description
        this._isEditable = !!isEditable
        this._isDragged = false
    }

    /**
     * Emits a change event and, if changeType is defined, a change:changeType event
     *
     * @param {String} changeType So that the change event is more specific, for instance if
     *   changeType is equal to 'title' a 'change' event and a 'change:title' event will be fired
     */
    emitChangeEvent(changeType = null) {
        this.emit('change', this)
        if (changeType) {
            this.emit(`change:${changeType}`, this)
        }
    }

    /**
     * Like "emitChangeEvent(changeType)", but also emits a 'change:style' event. This event should
     * be triggered for changes that can affect the visuals and other properties of the feature, but
     * not the positioning.
     *
     * @param {String} changeType
     */
    emitStylingChangeEvent(changeType = null) {
        this.emit('change:style', this)
        this.emitChangeEvent(changeType)
    }

    get id() {
        return this._id
    }
    // ID is immutable, no setter

    get coordinates() {
        return this._coordinates
    }
    set coordinates(newCoordinates) {
        if (Array.isArray(newCoordinates)) {
            // checking if we have received a unique coordinate
            if (
                newCoordinates.length === 2 &&
                !newCoordinates.some((coord) => Array.isArray(coord))
            ) {
                // as we want an array of coordinates, we wrap the unique coordinate in an array
                this._coordinates = [newCoordinates]
            } else {
                this._coordinates = newCoordinates
            }
            this.emitChangeEvent('coordinates')
        } else if (newCoordinates === null) {
            this._coordinates = newCoordinates
        } else {
            log.error(`feature.api new coordinates is not an array`, newCoordinates)
        }
    }
    get lastCoordinate() {
        return this._coordinates[this._coordinates.length - 1]
    }

    /**
     * Set the coordinates from the ol Feature
     *
     * @param {ol/Feature} olFeature Ol Feature to get the coordinate from
     */
    setCoordinatesFromFeature(olFeature) {
        this.coordinates = extractOlFeatureCoordinates(olFeature)
    }

    get title() {
        return this._title
    }
    set title(newTitle) {
        this._title = newTitle
        this.emitStylingChangeEvent('title')
    }

    get description() {
        return this._description
    }
    set description(newDescription) {
        this._description = newDescription
        this.emitStylingChangeEvent('description')
    }

    get isEditable() {
        return this._isEditable
    }
    // isEditable is immutable, no setter
}

/** @enum */
export const EditableFeatureTypes = {
    MARKER: 'MARKER',
    ANNOTATION: 'ANNOTATION',
    LINEPOLYGON: 'LINEPOLYGON',
    MEASURE: 'MEASURE',
}

/** Describe a feature that can be edited by the user, such as feature from the current drawing */
export class EditableFeature extends SelectableFeature {
    /**
     * @param {String | Number} id Unique identifier for this feature (unique in the context it
     *   comes from, not for the whole app)
     * @param {Number[][]} coordinates [[x,y],[x2.y2],...] or [x,y] if point geometry coordinates of
     *   this feature
     * @param {String} title Title of this feature
     * @param {String} description A description of this feature, can not be HTML content (only
     *   text)
     * @param {EditableFeatureTypes} featureType Type of this editable feature
     * @param {FeatureStyleColor} textColor Color for the text of this feature
     * @param {FeatureStyleSize} textSize Size of the text for this feature
     * @param {FeatureStyleColor} fillColor Color of the icon (if defined)
     * @param {DrawingIcon} icon Icon that will be covering this feature, can be null
     * @param {FeatureStyleSize} iconSize Size of the icon (if defined) that will be covering this
     *   feature
     */
    constructor(
        id,
        coordinates,
        title = '',
        description = '',
        featureType,
        textColor = RED,
        textSize = MEDIUM,
        fillColor = RED,
        icon = null,
        iconSize = MEDIUM
    ) {
        super(id, coordinates, title, description, true)
        this._featureType = featureType
        this._textColor = textColor
        this._textSize = textSize
        this._fillColor = fillColor
        this._icon = icon
        this._iconSize = iconSize
        this._geodesicCoordinates = null
    }

    /**
     * Create a new Editable Features. Omitted parameters means the
     * default value of the constructor will be used.
     *
     * @param {any} obj An object with key value pairs for the parameters of the constructor
     * @returns The new object
     */
    static newFeature(obj) {
        return new EditableFeature(
            obj.id,
            obj.coordinates,
            obj.title,
            obj.description,
            obj.featureType,
            obj.textColor,
            obj.textSize,
            obj.fillColor,
            obj.icon,
            obj.iconSize
        )
    }

    /**
     * Serialize the EditableFeature into a plain javascript object.
     *
     * NOTE: To avoid projection confusion and simplify the serialization/deserialization process,
     * the coordinates are not serialized. During deserialization the coordinates are set from
     * the geometry of the OL Feature.
     *
     * @returns {object} The serialized plain object
     */
    serialize() {
        /* Warning: Changing this method will break the compability of KML files */
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            featureType: this.featureType,
            textColor: this.textColor.serialize(),
            textSize: this.textSize.serialize(),
            fillColor: this.fillColor.serialize(),
            icon: this.icon ? this.icon.serialize() : null,
            iconSize: this.iconSize.serialize(),
        }
    }

    /**
     * This method deserializes an editable feature that is stored in the extra properties of an
     * openlayers feature. If there is no editable feature to deserialize (e.g. in the case of a kml
     * that was generated with mf-geoadmin3), the editable feature is instead reconstructed with the
     * styling information stored in the official '<style>' tag of the kml. It then recreates a
     * fully functional olFeature with the correct styling.
     *
     * @param {ol/Feature} olFeature An olFeature that was just deserialized with
     * @param {DrawingIconSet[]} availableIconSets Icon sets to use for the EditableFeature.
     * @returns {EditableFeature | Null} Returns the EditableFeature in case of success or null
     *   otherwise
     */
    static deserialize(olFeature, availableIconSets) {
        let editableFeature = olFeature.get('editableFeature')
        // in case we are deserializing a legacy KML (one made with mf-geoadmin3) the editableFeature object
        // will not be present, and we will have to rebuild one from the styles tags in the KML
        if (!editableFeature) {
            editableFeature = getEditableFeatureFromLegacyKmlFeature(olFeature, availableIconSets)
        } else {
            const o = JSON.parse(editableFeature)
            editableFeature = new EditableFeature(
                o.id,
                null,
                o.title,
                o.description,
                o.featureType,
                FeatureStyleColor.deserialize(o.textColor),
                FeatureStyleSize.deserialize(o.textSize),
                FeatureStyleColor.deserialize(o.fillColor),
                o.icon ? DrawingIcon.deserialize(o.icon) : null,
                FeatureStyleSize.deserialize(o.iconSize)
            )
        }
        if (editableFeature) {
            // Set the EditableFeature coordinates from the olFeature geometry
            editableFeature.setCoordinatesFromFeature(olFeature)

            olFeature.set('editableFeature', editableFeature)
            olFeature.setStyle(featureStyleFunction)
            if (editableFeature.isLineOrMeasure()) {
                /* The featureStyleFunction uses the geometries calculated in the geodesic object
                if present. The lines connecting the vertices of the geometry will appear
                geodesic (follow the shortest path) in this case instead of linear (be straight on
                the screen)  */
                olFeature.geodesic = new GeodesicGeometries(olFeature)
            }
        }
        return editableFeature
    }

    /**
     * Set the coordinates from the ol Feature
     *
     * @param {ol/Feature} olFeature Ol Feature to get the coordinate from
     */
    setCoordinatesFromFeature(olFeature) {
        super.setCoordinatesFromFeature(olFeature)
        this.geodesicCoordinates = extractOlFeatureGeodesicCoordinates(olFeature)
    }

    isLineOrMeasure() {
        return (
            this.featureType === EditableFeatureTypes.MEASURE ||
            this.featureType === EditableFeatureTypes.LINEPOLYGON
        )
    }

    /**
     * This getter is automatically called by openlayers when serializing the openlayers feature. In
     * fact, if objects are saved in the extra properties of a feature, openlayers will save their
     * 'value' property in the KML. Warning: This feature seems to be undocumented, but I did not
     * found another good way to do this.
     */
    get value() {
        return JSON.stringify(this.serialize())
    }

    // getters and setters for all properties (with event emit for setters)
    get featureType() {
        return this._featureType
    }
    // no setter for featureType, immutable

    /** @returns {FeatureStyleColor} */
    get textColor() {
        return this._textColor
    }
    /** @param newColor {FeatureStyleColor} */
    set textColor(newColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._textColor = newColor
            this.emitStylingChangeEvent('textColor')
        }
    }

    /** @returns {FeatureStyleSize} */
    get textSize() {
        return this._textSize
    }
    /** @returns {Number} */
    get textSizeScale() {
        return this._textSize?.textScale
    }
    /** @param newSize {FeatureStyleSize} */
    set textSize(newSize) {
        if (newSize && allStylingSizes.find((size) => size.textScale === newSize.textScale)) {
            this._textSize = newSize
            this.emitStylingChangeEvent('textSize')
        }
    }
    get font() {
        return this._textSize?.font
    }

    /** @returns {DrawingIcon | null} */
    get icon() {
        return this._icon
    }
    /** @param newIcon {DrawingIcon} */
    set icon(newIcon) {
        this._icon = newIcon
        this.emitStylingChangeEvent('icon')
    }
    /** @returns {String} */
    get iconUrl() {
        return this._icon?.generateURL(this.iconSize, this.fillColor)
    }

    generateOpenlayersIcon() {
        return this.icon
            ? new openlayersIcon({
                  src: this.iconUrl,
                  crossOrigin: 'Anonymous',
                  anchor: this.icon.anchor,
              })
            : null
    }

    /** @returns {FeatureStyleColor} */
    get fillColor() {
        return this._fillColor
    }
    /** @param newColor {FeatureStyleColor} */
    set fillColor(newColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._fillColor = newColor
            this.emitStylingChangeEvent('fillColor')
        }
    }

    /** @returns {FeatureStyleSize} */
    get iconSize() {
        return this._iconSize
    }
    /** @returns {Number} */
    get iconSizeScale() {
        return this._iconSize?.iconScale
    }
    /** @param newSize {FeatureStyleSize} */
    set iconSize(newSize) {
        if (newSize && allStylingSizes.find((size) => size.iconScale === newSize.iconScale)) {
            this._iconSize = newSize
            this.emitStylingChangeEvent('iconSize')
        }
    }

    /**
     * Tells if the feature is currently being dragged (and later dropped) by the user
     *
     * @returns {boolean}
     */
    get isDragged() {
        return this._isDragged
    }
    set isDragged(flag) {
        this._isDragged = flag
        this.emitChangeEvent('isDragged')
    }

    /**
     * Get/Set the Geodesic Coordinates. Those coordinates are used with a geodesic filling between
     * the coordinates. Those coordinates are used to draw the feature and for the height profile.
     */
    get geodesicCoordinates() {
        return this._geodesicCoordinates
    }
    set geodesicCoordinates(coordinates) {
        this._geodesicCoordinates = coordinates
    }
}

/**
 * Describe a feature from the backend, so a feature linked to a backend layer (see
 * {@link getFeature}) below
 */
export class LayerFeature extends SelectableFeature {
    /**
     * @param {GeoAdminLayer} layer The layer in which this feature belongs
     * @param {Number | String} id The unique feature ID in the layer it is part of
     * @param {String} name The name (localized) of this feature
     * @param {String} htmlPopup HTML code for this feature's popup (or tooltip)
     * @param {Number[][]} coordinates [[x,y],[x2,y2],...] coordinate in EPSG:3857
     * @param {Number[]} extent Extent of the feature expressed with two point, bottom left and top
     *   right, in EPSG:3857
     * @param {Object} geometry GeoJSON geometry (if exists)
     */
    constructor(layer, id, name, htmlPopup, coordinates, extent, geometry = null) {
        super(id, coordinates, name, null, false)
        this._layer = layer
        // for now the backend gives us the description of the feature as HTML
        // it would be good to change that to only data in the future
        this._htmlPopup = htmlPopup
        this._extent = extent
        this._geometry = geometry
    }

    // overwriting get ID so that we use the layer ID with the feature ID
    get id() {
        return `${this._layer.getID()}-${this._id}`
    }

    // getters for all attributes (no setters)
    get layer() {
        return this._layer
    }

    /** @returns {LayerTypes} */
    getLayerType() {
        return this._layer?.type
    }

    get htmlPopup() {
        return this._htmlPopup
    }

    get extent() {
        return this._extent
    }

    get geometry() {
        return this._geometry
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
 * @param {CoordinateSystem} projection Projection in which the coordinates of the features should be expressed
 * @returns {Promise<LayerFeature[]>}
 */
export const identify = (
    layer,
    coordinate,
    mapExtent,
    screenWidth,
    screenHeight,
    lang,
    projection = WEBMERCATOR
) => {
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
                    },
                }
            )
            .then((response) => {
                const featureRequests = []
                if (response.data && response.data.results && response.data.results.length > 0) {
                    // for each feature that has been identify, we will now load their metadata and tooltip content
                    response.data.results.forEach((feature) => {
                        featureRequests.push(getFeature(layer, feature.id, lang, projection))
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
 * @param {CoordinateSystem} projection Projection in which the coordinates of the features should be expressed
 * @returns {Promise<LayerFeature>}
 */
const getFeature = (layer, featureID, lang = 'en', projection = WEBMERCATOR) => {
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
                        sr: projection.epsgNumber,
                        geometryFormat: 'geojson',
                    },
                }),
                axios.get(`${featureUrl}/htmlPopup`, {
                    params: {
                        sr: projection.epsgNumber,
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
                const featureName = featureMetadata?.properties?.name
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
