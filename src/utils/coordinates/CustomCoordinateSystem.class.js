import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'

/**
 * Description of a coordinate system that will not use the standard resolution and zoom level.
 *
 * This can be used to describe national coordinate systems that are built to represent a subset of
 * the World, with a custom zoom pyramid to match their map resolutions.
 *
 * You can see examples by following {@link SwissCoordinateSystem} and its children.
 *
 * @abstract
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export default class CustomCoordinateSystem extends CoordinateSystem {
    /**
     * A (descending) list of all the available resolutions for this coordinate system
     *
     * @returns {Number[]}
     */
    getResolutions() {
        throw new Error('Not yet implemented')
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
            return [this.bounds.lowerX, this.bounds.upperY]
        }
        return [0, 0]
    }

    /**
     * Transforms a zoom level from this custom coordinate system, back to a zoom level such as
     * described in https://wiki.openstreetmap.org/wiki/Zoom_levels
     *
     * @abstract
     * @param {Number} customZoomLevel A zoom level in this custom coordinate system
     * @returns {Number} A standard (or OpenStreetMap) zoom level
     */
    transformCustomZoomLevelToStandard(customZoomLevel) {
        throw new Error('Not yet implemented')
    }

    /**
     * Transforms a standard (or OpenStreetMap) zoom level into a zoom level in this coordinate
     * system
     *
     * @param {Number} standardZoomLevel A standard zoom level
     * @returns {Number} A zoom level in this custom coordinate system
     */
    transformStandardZoomLevelToCustom(standardZoomLevel) {
        throw new Error('Not yet implemented')
    }
}
