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
