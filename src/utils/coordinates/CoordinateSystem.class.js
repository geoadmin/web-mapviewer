import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import proj4 from 'proj4'

export default class CoordinateSystem {
    /**
     * @param {String} id Identification of this coordinate system with a human-readable ID (i.e.
     *   LV95/WGS84/LV03/etc...)
     * @param {String} epsg EPSG:xxxx representation of this coordinate system
     * @param {Number} epsgNumber Same as EPSG but only the numerical part (without the "EPSG:")
     * @param {String} label Label to show users when they are dealing with this coordinate system
     * @param {String} proj4transformationMatrix A string describing how proj4 should handle projection/reprojection of
     * this coordinate system, in regard to WGS84. These matrices can be found on the EPSG website for each projection
     * in the Export section, inside the PROJ.4 export type (can be directly accessed by adding .proj4 to the URL of
     * one projection's page on the EPSG website, i.e. https://epsg.io/3857.proj4 for WebMercator)
     * @param {CoordinateSystemBounds} bounds Bounds of this projection system, expressed as in its own coordinate
     * system. These boundaries can also be found on the EPSG website, in the section "Projected bounds" of a
     * projection's page
     */
    constructor(id, epsg, epsgNumber, label, proj4transformationMatrix, bounds = null) {
        this.id = id
        this.epsg = epsg
        this.epsgNumber = epsgNumber
        this.label = label
        this.proj4transformationMatrix = proj4transformationMatrix
        this.bounds = bounds
    }

    /**
     * Transforms the bounds of this coordinates system to be expressed in the given coordinate system
     *
     * If the one of the coordinate system is invalid, or if bounds are not defined, it will return null
     *
     * @param {CoordinateSystem} coordinateSystem
     * @returns {CoordinateSystemBounds | null}
     */
    getBoundsAs(coordinateSystem) {
        if (coordinateSystem instanceof CoordinateSystem && this.bounds) {
            if (coordinateSystem.epsg === this.epsg) {
                return this.bounds
            }
            const newBottomLeft = proj4(this.epsg, coordinateSystem.epsg, this.bounds.bottomLeft)
            const newTopRight = proj4(this.epsg, coordinateSystem.epsg, this.bounds.topRight)
            return new CoordinateSystemBounds(
                newBottomLeft[0],
                newTopRight[0],
                newBottomLeft[1],
                newTopRight[1]
            )
        }
        return null
    }

    /**
     * Tells if a coordinate (described by X and Y) is in bound of this coordinate system.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {boolean}
     */
    isInBounds(x, y) {
        return this.bounds?.isInBounds(x, y)
    }
}
