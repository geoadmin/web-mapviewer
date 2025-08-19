import type { SingleCoordinate } from '@/coordinatesUtils.ts'
import type CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'

import CoordinateSystem, { type CoordinateSystemProps } from '@/proj/CoordinateSystem'

export interface CustomCoordinateSystemProps extends CoordinateSystemProps {
    /** With custom coordinate system, bounds are mandatory. */
    bounds: CoordinateSystemBounds
}

/**
 * Description of a coordinate system that will not use the standard resolution and zoom level
 * (a.k.a. mercator pyramid).
 *
 * This can be used to describe national coordinate systems that are built to represent a subset of
 * the World, with a custom zoom pyramid to match their map resolutions.
 *
 * You can see examples by following {@link SwissCoordinateSystem} and its children.
 *
 * @abstract
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export default abstract class CustomCoordinateSystem extends CoordinateSystem {
    declare public readonly bounds: CoordinateSystemBounds

    protected constructor(args: CustomCoordinateSystemProps) {
        super(args)
    }

    /**
     * The origin to use as anchor for tile coordinate calculations. It will return the bound's
     * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
     * behavior you want, you have to override this function.
     */
    getTileOrigin(): SingleCoordinate {
        return this.bounds.topLeft
    }

    /**
     * Transforms a zoom level from this custom coordinate system, back to a zoom level such as
     * described in https://wiki.openstreetmap.org/wiki/Zoom_levels
     *
     * @abstract
     * @param customZoomLevel A zoom level in this custom coordinate system
     * @returns A standard (or OpenStreetMap) zoom level
     */
    abstract transformCustomZoomLevelToStandard(customZoomLevel: number): number

    /**
     * Transforms a standard (or OpenStreetMap) zoom level into a zoom level in this coordinate
     * system
     *
     * @param standardZoomLevel A standard zoom level
     * @returns A zoom level in this custom coordinate system
     */
    abstract transformStandardZoomLevelToCustom(standardZoomLevel: number): number
}
