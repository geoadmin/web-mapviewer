/** @module ol/geom/LineString */
import { extend } from 'ol/array'
import { closestSquaredDistanceXY } from 'ol/extent'
import { assignClosestPoint, maxSquaredDelta } from 'ol/geom/flat/closest'
import { deflateCoordinates } from 'ol/geom/flat/deflate'
import { inflateCoordinates } from 'ol/geom/flat/inflate'
import { interpolatePoint, lineStringCoordinateAtM } from 'ol/geom/flat/interpolate'
import { intersectsLineString } from 'ol/geom/flat/intersectsextent'
import { lineStringLength } from 'ol/geom/flat/length'
import { forEach as forEachSegment } from 'ol/geom/flat/segments'
import { douglasPeucker } from 'ol/geom/flat/simplify'

import SimpleGeometry from '@/utils/ol/format/SimpleGeometry'

/**
 * @classdesc
 * Linestring geometry.
 *
 * @api
 */
class LineString extends SimpleGeometry {
    /**
     * @param {import('../coordinate.js').Coordinate[] | number[]} coordinates Coordinates. For
     *   internal use, flat coordinates in combination with `layout` are also accepted.
     * @param {import('./Geometry.js').GeometryLayout} [layout] Layout.
     */
    constructor(coordinates, layout) {
        super()

        console.error('LineString: constructor')

        /**
         * @private
         * @type {import('../coordinate.js').Coordinate | null}
         */
        this.flatMidpoint_ = null

        /**
         * @private
         * @type {number}
         */
        this.flatMidpointRevision_ = -1

        /**
         * @private
         * @type {number}
         */
        this.maxDelta_ = -1

        /**
         * @private
         * @type {number}
         */
        this.maxDeltaRevision_ = -1

        console.error('LineString: constructor setFlatCoordinates: ', layout)
        console.error('LineString: constructor setFlatCoordinates: ', coordinates)

        if (layout !== undefined && !Array.isArray(coordinates[0])) {
            console.error('setFlatCoordinates: ', coordinates)
            this.setFlatCoordinates(layout, /** @type {number[]} */ (coordinates))
            console.error('setFlatCoordinates: ', this.flatCoordinates)
        } else {
            this.setCoordinates(
                /** @type {import('../coordinate.js').Coordinate[]} */ (coordinates),
                layout
            )
            console.error('setCoordinates: ', this.coordinates)
        }
    }

    /**
     * Append the passed coordinate to the coordinates of the linestring.
     *
     * @param {import('../coordinate.js').Coordinate} coordinate Coordinate.
     * @api
     */
    appendCoordinate(coordinate) {
        console.error('LineString appendCoordinate: ', coordinate)
        extend(this.flatCoordinates, coordinate)
        this.changed()
    }

    /**
     * Make a complete copy of the geometry.
     *
     * @returns {!LineString} Clone.
     * @api
     */
    clone() {
        const lineString = new LineString(this.flatCoordinates.slice(), this.layout)
        lineString.applyProperties(this)
        return lineString
    }

    /**
     * @param {number} x X.
     * @param {number} y Y.
     * @param {import('../coordinate.js').Coordinate} closestPoint Closest point.
     * @param {number} minSquaredDistance Minimum squared distance.
     * @returns {number} Minimum squared distance.
     */
    closestPointXY(x, y, closestPoint, minSquaredDistance) {
        if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
            return minSquaredDistance
        }
        if (this.maxDeltaRevision_ != this.getRevision()) {
            this.maxDelta_ = Math.sqrt(
                maxSquaredDelta(
                    this.flatCoordinates,
                    0,
                    this.flatCoordinates.length,
                    this.stride,
                    0
                )
            )
            this.maxDeltaRevision_ = this.getRevision()
        }
        return assignClosestPoint(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            this.maxDelta_,
            false,
            x,
            y,
            closestPoint,
            minSquaredDistance
        )
    }

    /**
     * Iterate over each segment, calling the provided callback. If the callback returns a truthy
     * value the function returns that value immediately. Otherwise the function returns `false`.
     *
     * @template T,S
     * @param {function(this: S, import("../coordinate.js").Coordinate, import("../coordinate.js").Coordinate): T} callback
     *   Function called for each segment. The function will receive two arguments, the start and end
     *   coordinates of the segment.
     * @returns {T | boolean} Value.
     * @api
     */
    forEachSegment(callback) {
        return forEachSegment(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            callback
        )
    }

    /**
     * Returns the coordinate at `m` using linear interpolation, or `null` if no such coordinate
     * exists.
     *
     * `extrapolate` controls extrapolation beyond the range of Ms in the MultiLineString. If
     * `extrapolate` is `true` then Ms less than the first M will return the first coordinate and Ms
     * greater than the last M will return the last coordinate.
     *
     * @param {number} m M.
     * @param {boolean} [extrapolate] Extrapolate. Default is `false`.
     * @returns {import('../coordinate.js').Coordinate | null} Coordinate.
     * @api
     */
    getCoordinateAtM(m, extrapolate) {
        if (this.layout != 'XYM' && this.layout != 'XYZM') {
            return null
        }
        extrapolate = extrapolate !== undefined ? extrapolate : false
        return lineStringCoordinateAtM(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            m,
            extrapolate
        )
    }

    /**
     * Return the coordinates of the linestring.
     *
     * @returns {import('../coordinate.js').Coordinate[]} Coordinates.
     * @api
     */
    getCoordinates() {
        return inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride)
    }

    /**
     * Return the coordinate at the provided fraction along the linestring. The `fraction` is a
     * number between 0 and 1, where 0 is the start of the linestring and 1 is the end.
     *
     * @param {number} fraction Fraction.
     * @param {import('../coordinate.js').Coordinate} [dest] Optional coordinate whose values will
     *   be modified. If not provided, a new coordinate will be returned.
     * @returns {import('../coordinate.js').Coordinate} Coordinate of the interpolated point.
     * @api
     */
    getCoordinateAt(fraction, dest) {
        return interpolatePoint(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            fraction,
            dest,
            this.stride
        )
    }

    /**
     * Return the length of the linestring on projected plane.
     *
     * @returns {number} Length (on projected plane).
     * @api
     */
    getLength() {
        return lineStringLength(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride)
    }

    /** @returns {number[]} Flat midpoint. */
    getFlatMidpoint() {
        if (this.flatMidpointRevision_ != this.getRevision()) {
            this.flatMidpoint_ = this.getCoordinateAt(0.5, this.flatMidpoint_ ?? undefined)
            this.flatMidpointRevision_ = this.getRevision()
        }
        return /** @type {number[]} */ (this.flatMidpoint_)
    }

    /**
     * @param {number} squaredTolerance Squared tolerance.
     * @returns {LineString} Simplified LineString.
     * @protected
     */
    getSimplifiedGeometryInternal(squaredTolerance) {
        console.error('getSimplifiedGeometryInternal', this.flatCoordinates)
        /** @type {number[]} */
        const simplifiedFlatCoordinates = []
        simplifiedFlatCoordinates.length = douglasPeucker(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            squaredTolerance,
            simplifiedFlatCoordinates,
            0
        )
        return new LineString(simplifiedFlatCoordinates, 'XY')
    }

    /**
     * Get the type of this geometry.
     *
     * @returns {import('./Geometry.js').Type} Geometry type.
     * @api
     */
    getType() {
        return 'LineString'
    }

    /**
     * Test if the geometry and the passed extent intersect.
     *
     * @param {import('../extent.js').Extent} extent Extent.
     * @returns {boolean} `true` if the geometry and the extent intersect.
     * @api
     */
    intersectsExtent(extent) {
        return intersectsLineString(
            this.flatCoordinates,
            0,
            this.flatCoordinates.length,
            this.stride,
            extent
        )
    }

    /**
     * Set the coordinates of the linestring.
     *
     * @param {!import('../coordinate.js').Coordinate[]} coordinates Coordinates.
     * @param {import('./Geometry.js').GeometryLayout} [layout] Layout.
     * @api
     */
    setCoordinates(coordinates, layout) {
        this.setLayout(layout, coordinates, 1)
        if (!this.flatCoordinates) {
            this.flatCoordinates = []
        }
        this.flatCoordinates.length = deflateCoordinates(
            this.flatCoordinates,
            0,
            coordinates,
            this.stride
        )
        this.changed()
    }
}

export default LineString
