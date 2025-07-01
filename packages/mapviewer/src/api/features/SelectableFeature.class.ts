import type { SingleCoordinate } from '@geoadmin/coordinates'
import type { Geometry } from 'geojson'
import type Feature from 'ol/Feature'

import log from '@geoadmin/log'

import type { FlatExtent } from '@/utils/extentUtils'

import { extractOlFeatureCoordinates } from '@/api/features/features.api.ts'
import EventEmitter from '@/utils/EventEmitter.class'

export interface SelectableFeatureData {
    /**
     * Unique identifier for this feature (unique in the context it comes from, not for the whole
     * app)
     */
    id: string | number
    /** Coordinates describing the center of this feature. Format is [[x,y],[x2,y2],...] */
    coordinates: SingleCoordinate[]
    /** Title of this feature */
    title: string
    /** A description of this feature. Cannot be HTML content (only text). */
    description?: string
    /** Extent of this feature (if any) expressed as [minX, minY, maxX, maxY]. */
    extent?: FlatExtent
    /** GeoJSON representation of this feature (if it has a geometry, for points it isn't necessary). */
    geometry?: Geometry
    /** Whether this feature is editable when selected (color, size, etc...). */
    isEditable?: boolean
}

/**
 * Representation of a feature that can be selected by the user on the map. This feature can be
 * edited if the corresponding flag says so (it will then fire "change" events any time one property
 * of the instance has changed)
 *
 * This will then be specialized in (at least) two flavor of features, layer feature (coming from
 * our backend, with extra information attached) and drawing feature (that can be modified by the
 * user)
 */
export default abstract class SelectableFeature extends EventEmitter {
    readonly id: string | number
    private _coordinates: SingleCoordinate[] | undefined
    private _title: string | undefined
    private _description: string | undefined
    geometry: Geometry | undefined
    extent: FlatExtent | undefined
    readonly isEditable: boolean

    protected constructor(featureData: SelectableFeatureData) {
        super()
        const {
            id,
            coordinates,
            title,
            description,
            extent,
            geometry,
            isEditable = false,
        } = featureData
        this.id = id
        // init privates (having setter) with undefined
        this._coordinates = undefined
        this._title = undefined
        this._description = undefined
        // now using the setter
        this.coordinates = coordinates
        this.title = title
        this.description = description
        this.geometry = geometry
        this.extent = extent
        this.isEditable = isEditable
    }

    /**
     * Emits a change event and, if changeType is defined, a change:changeType event
     *
     * @param changeType So that the change event is more specific, for instance if changeType is
     *   equal to 'title' a 'change' event and a 'change:title' event will be fired
     */
    emitChangeEvent(changeType?: string) {
        this.emit('change', this)
        if (changeType) {
            this.emit(`change:${changeType}`, this)
        }
    }

    /**
     * Like "emitChangeEvent(changeType)", but also emits a 'change:style' event. This event should
     * be triggered for changes that can affect the visuals and other properties of the feature, but
     * not the positioning.
     */
    emitStylingChangeEvent(changeType?: string) {
        this.emit('change:style', this)
        this.emitChangeEvent(changeType)
    }

    get coordinates(): SingleCoordinate[] | undefined {
        return this._coordinates
    }

    set coordinates(newCoordinates: SingleCoordinate | SingleCoordinate[] | undefined) {
        if (Array.isArray(newCoordinates)) {
            // checking if we have received a unique coordinate
            if (
                newCoordinates.length === 2 &&
                !newCoordinates.some((value) => Array.isArray(value))
            ) {
                // as we want an array of coordinates, we wrap the unique coordinate in an array
                this._coordinates = [newCoordinates as SingleCoordinate]
            } else {
                this._coordinates = newCoordinates as SingleCoordinate[]
            }
            this.emitChangeEvent('coordinates')
        } else if (newCoordinates === undefined) {
            this._coordinates = newCoordinates
        } else {
            log.error(`feature.api new coordinates is not an array`, newCoordinates)
        }
    }

    get lastCoordinate(): SingleCoordinate | undefined {
        if (!this._coordinates) {
            return
        }
        return this._coordinates.slice(-1)[0]
    }

    /**
     * Set the coordinates from the ol Feature
     *
     * @param olFeature Ol Feature to get the coordinate from
     */
    setCoordinatesFromFeature(olFeature: Feature) {
        this.coordinates = extractOlFeatureCoordinates(olFeature)
    }

    get title(): string | undefined {
        return this._title
    }

    set title(newTitle: string | undefined) {
        this._title = newTitle
        this.emitStylingChangeEvent('title')
    }

    get description(): string | undefined {
        return this._description
    }

    set description(newDescription: string | undefined) {
        this._description = newDescription
        this.emitStylingChangeEvent('description')
    }
}
