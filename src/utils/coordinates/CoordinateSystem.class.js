import { getTopLeft, getWidth } from 'ol/extent'
import proj4 from 'proj4'

import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import { round } from '@/utils/numberUtils'

/**
 * These are the zoom levels, for each projection, which give us a 1:25'000 ratio map.
 *
 * These variables are declared here, as the config.js import the LV95 coordinate system, and it
 * could lead to initialization errors (even when initializing the constants before importing the
 * class). Thus we declare them here, at the root class of the coordinates systems.
 *
 * @type {Number}
 */

export const STANDARD_ZOOM_LEVEL_1_25000_MAP = 15.5
export const SWISS_ZOOM_LEVEL_1_25000_MAP = 8

/**
 * Representation of a coordinate system (or also called projection system) in the context of this
 * application.
 *
 * These coordinate systems will be used to drive the mapping framework, helping it grasp which zoom
 * level or resolution to show, where to start the view (with the center of bounds), how to handle a
 * projection change, etc...
 *
 * @abstract
 */
export default class CoordinateSystem {
    /**
     * @param {Number} epsgNumber EPSG:xxxx representation of this coordinate system, but only the
     *   numerical part (without the "EPSG:")
     * @param {String} label Label to show users when they are dealing with this coordinate system
     *   (can be a translation key)
     * @param {String} proj4transformationMatrix A string describing how proj4 should handle
     *   projection/reprojection of this coordinate system, in regard to WGS84. These matrices can
     *   be found on the EPSG website for each projection in the Export section, inside the PROJ.4
     *   export type (can be directly accessed by adding .proj4 to the URL of one projection's page
     *   on the EPSG website, i.e. https://epsg.io/3857.proj4 for WebMercator)
     * @param {CoordinateSystemBounds} bounds Bounds of this projection system, expressed as in its
     *   own coordinate system. These boundaries can also be found on the EPSG website, in the
     *   section "Projected bounds" of a projection's page. It is possible to specify a custom
     *   center to these bounds, so that the application starts at this custom center instead of the
     *   natural center (when no coordinates are specified at startup).
     */
    constructor(epsgNumber, label, proj4transformationMatrix, bounds = null) {
        this.epsgNumber = epsgNumber
        /**
         * Full EPSG identifier used by most libraries (such as proj4, or OpenLayers)
         *
         * @type {`EPSG:${Number}`}
         */
        this.epsg = `EPSG:${epsgNumber}`
        this.label = label
        this.proj4transformationMatrix = proj4transformationMatrix
        this.bounds = bounds
    }

    /**
     * Transforms the bounds of this coordinates system to be expressed in the wanted coordinate
     * system
     *
     * If the coordinate system is invalid, or if bounds are not defined, it will return null
     *
     * @param {CoordinateSystem} coordinateSystem The target coordinate system we want bounds
     *   expressed in
     * @returns {CoordinateSystemBounds | null} Bounds, expressed in the coordinate system, or null
     *   if bounds are undefined or coordinate system is invalid
     */
    getBoundsAs(coordinateSystem) {
        if (coordinateSystem instanceof CoordinateSystem && this.bounds) {
            if (coordinateSystem.epsg === this.epsg) {
                return this.bounds
            }
            const newBottomLeft = proj4(this.epsg, coordinateSystem.epsg, this.bounds.bottomLeft)
            const newTopRight = proj4(this.epsg, coordinateSystem.epsg, this.bounds.topRight)
            let customCenter = null
            if (this.bounds.customCenter) {
                customCenter = proj4(this.epsg, coordinateSystem.epsg, this.bounds.customCenter)
            }
            return new CoordinateSystemBounds(
                newBottomLeft[0],
                newTopRight[0],
                newBottomLeft[1],
                newTopRight[1],
                customCenter
            )
        }
        return null
    }

    /**
     * Tells if a coordinate (described by X and Y) is in bound of this coordinate system.
     *
     * Will return false if no bounds are defined for this coordinate system
     *
     * @param {Number} x
     * @param {Number} y
     * @returns {boolean}
     */
    isInBounds(x, y) {
        return !!this.bounds?.isInBounds(x, y)
    }

    /**
     * @abstract The Index in the resolution list where the 1:25000 zoom level is
     * @returns {Number}
     */
    get1_25000ZoomLevel() {
        throw new Error('Not yet implemented')
    }

    /**
     * @abstract
     * @returns {Number} The default zoom to use when starting the map in this coordinate system (if
     *   none are set so far)
     */
    getDefaultZoom() {
        throw Error('Not yet implemented')
    }

    /**
     * Rounds a zoom level.
     *
     * You can, by overwriting this function, add custom zoom level roundings or similar function in
     * your custom coordinate systems.
     *
     * @param {Number} zoom A zoom level in this coordinate system
     * @returns {Number} The given zoom level after rounding
     */
    roundZoomLevel(zoom) {
        return round(zoom, 3)
    }

    /**
     * Returns the corresponding resolution to the given zoom level and center (some coordinate
     * system must take some deformation into account the further north we are)
     *
     * @abstract
     * @param {Number} zoom A zoom level
     * @param {[Number, Number]} center The current center of view, expressed with this coordinate
     *   system
     * @returns {Number} The resolution at the given zoom level, in the context of this coordinate
     *   system
     */
    getResolutionForZoomAndCenter(_zoom, _center) {
        throw Error('Not yet implemented')
    }

    /**
     * Returns the zoom level to match the given resolution and center (some coordinate system must
     * take some deformation into account the further north we are)
     *
     * @abstract
     * @param resolution The resolution of the map, expressed in meter per pixel
     * @param {[Number, Number]} center The current center of view, expressed in this coordinate
     *   system
     * @returns {Number} The corresponding zoom level, in the context of this coordinate system
     */
    getZoomForResolutionAndCenter(_resolution, _center) {
        throw Error('Not yet implemented')
    }

    /**
     * Returns a rounded value of a coordinate value, in the context of this coordinate system. This
     * enables us to decide how many decimal points we want to keep for numbers after calculation
     * within this coordinate system (no need to keep values that are irrelevant to precision for
     * most maps, such as below 1cm)
     *
     * @abstract
     * @param {Number} value A value to be rounded
     * @returns {Number} The rounded value, with desired remaining decimal point for this coordinate
     *   system
     */
    roundCoordinateValue(_value) {
        throw Error('Not yet implemented')
    }
    /**
     * A (descending) list of all the available resolutions for this coordinate system. If this is
     * not the behavior you want, you have to override this function.
     *
     * @returns {Number[]}
     */
    getResolutions() {
        const extent = this.bounds.flatten
        const size = getWidth(extent) / 256
        const resolutions = []
        for (let z = 0; z < 19; ++z) {
            resolutions[z] = size / Math.pow(2, z)
        }
        return resolutions
    }

    /**
     * The origin to use as anchor for tile coordinate calculations. It will return the bound's
     * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
     * behavior you want, you have to override this function.
     *
     * If no bounds are defined, it will return [0, 0]
     *
     * @returns {[Number, Number]}
     */
    getTileOrigin() {
        if (this.bounds) {
            const extent = this.bounds.flatten
            const origin = getTopLeft(extent)
            return origin
        } else {
            return [0, 0]
        }
    }

    /**
     * List of matrix identifiers for this coordinate system. If this is not the behavior you want,
     * you have to override this function.
     *
     * @returns {Number[]}
     */
    getMatrixIds() {
        const matrixIds = []

        for (let z = 0; z < this.getResolutions().length; ++z) {
            matrixIds[z] = z
        }
        return matrixIds
    }

    /**
     * Returns the EPSG identifier of this coordinate system
     *
     * @returns {String}
     */
    getCode() {
        return `EPSG:${this.epsgNumber}`
    }
}
