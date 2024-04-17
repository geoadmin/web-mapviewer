import { extractOlFeatureCoordinates } from '@/api/features/features.api.js'
import EventEmitter from '@/utils/EventEmitter.class.js'
import log from '@/utils/logging.js'

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
export default class SelectableFeature extends EventEmitter {
    /**
     * @param {String | Number} featureData.id Unique identifier for this feature (unique in the
     *   context it comes from, not for the whole app)
     * @param {[[Number, Number]]} featureData.coordinates Coordinates of the center of this
     *   feature. Format is [[x,y],[x2,y2],...]
     * @param {String} featureData.title Title of this feature
     * @param {String | null} [featureData.description=null] A description of this feature, cannot
     *   be HTML content (only text). Default is `null`
     * @param {[Number, Number, Number, Number] | null} [featureData.extent=null] Extent of this
     *   feature (if any) expressed as [minX, minY, maxX, maxY]. Default is `null`
     * @param {Object | null} [featureData.geometry=null] GeoJSON representation of this feature (if
     *   it has a geometry, for points it isn't necessary). Default is `null`
     * @param {Boolean} [featureData.isEditable=false] Whether this feature is editable when
     *   selected (color, size, etc...). Default is `false`
     */
    constructor(featureData) {
        super()
        const {
            id,
            coordinates,
            title,
            description = null,
            extent = null,
            geometry = null,
            isEditable = false,
        } = featureData
        this.id = id
        // using the setter for coordinate (see below)

        // if coordinates are not defined, we set them to null
        this.coordinates = coordinates ? coordinates : null
        this.title = title
        this.description = description
        this.geometry = geometry
        this.extent = extent
        this.isEditable = !!isEditable
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
        return this._coordinates.slice(-1)[0]
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
}
