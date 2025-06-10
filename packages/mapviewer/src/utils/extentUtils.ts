import type { SingleCoordinate } from '@geoadmin/coordinates'

import { CoordinateSystem, WGS84 } from '@geoadmin/coordinates'
import { round } from '@geoadmin/numbers'
import { bbox, buffer, point } from '@turf/turf'
import { type Extent, getIntersection as getExtentIntersection } from 'ol/extent'
import proj4 from 'proj4'

export type FlatExtent = [number, number, number, number]
export type NormalizedExtent = [[number, number], [number, number]]

/**
 * Projection of an extent, described as [minx, miny, maxx, maxy].
 *
 * @param fromProj Current projection used to describe the extent
 * @param toProj Target projection we want the extent be expressed in
 * @param extent An extent, described as `[minx, miny, maxx, maxy].`
 * @returns The reprojected extent, or undefined if the given extent is not an array of four numbers
 */
export function projExtent(
    fromProj: CoordinateSystem,
    toProj: CoordinateSystem,
    extent: FlatExtent
): FlatExtent {
    if (extent.length === 4) {
        const bottomLeft = proj4(fromProj.epsg, toProj.epsg, [
            extent[0],
            extent[1],
        ]) as SingleCoordinate
        const topRight = proj4(fromProj.epsg, toProj.epsg, [
            extent[2],
            extent[3],
        ]) as SingleCoordinate
        return [...bottomLeft, ...topRight].map((value) =>
            toProj.roundCoordinateValue(value)
        ) as FlatExtent
    }
    return extent
}

/**
 * Return an extent normalized to [[x, y], [x, y]] from a flat extent
 *
 * @param extent Extent to normalize
 * @returns Extent in the form [[x, y], [x, y]]
 */
export function normalizeExtent(extent: FlatExtent | NormalizedExtent): NormalizedExtent {
    let extentNormalized = extent
    if (extent?.length === 4) {
        // convert to the flat extent to [[x, y], [x, y]]
        extentNormalized = [
            [extent[0], extent[1]],
            [extent[2], extent[3]],
        ]
    }
    return extentNormalized as NormalizedExtent
}

/**
 * Flatten extent
 *
 * @param extent Extent to flatten
 * @returns Flatten extent in from [minx, miny, maxx, maxy]
 */
export function flattenExtent(extent: FlatExtent | NormalizedExtent): FlatExtent {
    let flattenExtent = extent
    if (extent?.length === 2) {
        flattenExtent = [...extent[0], ...extent[1]]
    }
    return flattenExtent as FlatExtent
}

/**
 * Get the intersection of the extent with the current projection, as a flatten extent expressed in
 * the current projection
 *
 * @param extent Such as [minx, miny, maxx, maxy]. or [bottomLeft, topRight]
 * @param extentProjection
 * @param currentProjection
 */
export function getExtentIntersectionWithCurrentProjection(
    extent: FlatExtent | NormalizedExtent,
    extentProjection: CoordinateSystem,
    currentProjection: CoordinateSystem
): FlatExtent | undefined {
    if (
        (extent?.length !== 4 && extent?.length !== 2) ||
        !extentProjection ||
        !currentProjection ||
        !currentProjection.bounds
    ) {
        return undefined
    }
    let currentProjectionAsExtentProjection: FlatExtent = currentProjection.bounds
        .flatten as FlatExtent
    if (extentProjection.epsg !== currentProjection.epsg) {
        // We used to reproject the extent here, but there's problem arising if current projection is LV95 and
        // the extent is going a little bit out of Switzerland.
        // As LV95 is quite location-locked, the further we get, the bigger the mathematical errors start growing.
        // So to counteract that, we transform the current projection bounds in the extent projection to do the comparison.
        currentProjectionAsExtentProjection = projExtent(
            currentProjection,
            extentProjection,
            currentProjectionAsExtentProjection
        )
    }
    let finalExtent: Extent = getExtentIntersection(
        flattenExtent(extent),
        currentProjectionAsExtentProjection
    )
    if (
        !finalExtent ||
        // OL now populates the extent with Infinity when nothing is in common, instead returning a null value
        finalExtent.every((value) => Math.abs(value) === Infinity)
    ) {
        return undefined
    }
    if (extentProjection.epsg !== currentProjection.epsg) {
        // if we transformed the current projection extent above, we now need to output the correct proj
        finalExtent = projExtent(extentProjection, currentProjection, finalExtent as FlatExtent)
    }

    return flattenExtent(finalExtent as FlatExtent)
}

interface ConfigCreatePixelExtentAround {
    /**
     * Number of pixels the extent should be (if s100 is given, a box of 100x100 pixels with the
     * coordinate at its center will be returned)
     */
    size: number
    /** Where the center of the "size" pixel(s) extent should be. */
    coordinate: SingleCoordinate
    /** Projection used to describe the coordinates */
    projection: CoordinateSystem
    /** Current map resolution, necessary to calculate how much distance "size" pixel(s) means. */
    resolution: number
    /** Tells if the extent's value should be rounded before being returned. Default is `false` */
    rounded?: boolean
}

export function createPixelExtentAround(
    config: ConfigCreatePixelExtentAround
): FlatExtent | undefined {
    const { size, coordinate, projection, resolution, rounded = false } = config
    if (!size || !coordinate || !projection || !resolution) {
        return undefined
    }
    let coordinatesWgs84 = coordinate
    if (projection.epsg !== WGS84.epsg) {
        coordinatesWgs84 = proj4(projection.epsg, WGS84.epsg, coordinate)
    }
    const bufferAround = buffer(
        point(coordinatesWgs84),
        // sphere of the wanted number of pixels as radius around the coordinate
        size * resolution,
        { units: 'meters' }
    )
    if (!bufferAround) {
        return undefined
    }
    const extent: FlatExtent = projExtent(WGS84, projection, bbox(bufferAround) as FlatExtent)

    if (rounded) {
        return extent.map((value: number) => round(value)) as FlatExtent
    }
    return extent
}
