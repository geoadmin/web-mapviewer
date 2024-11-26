import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { point } from '@turf/helpers'
import { getIntersection as getExtentIntersection } from 'ol/extent'
import proj4 from 'proj4'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { round } from '@/utils/numberUtils'

/**
 * Projection of an extent, described as [minx, miny, maxx, maxy].
 *
 * @param {CoordinateSystem} fromProj Current projection used to describe the extent
 * @param {CoordinateSystem} toProj Target projection we want the extent be expressed in
 * @param {Number[]} extent An extent, described as `[minx, miny, maxx, maxy].`
 * @returns {null | Number[]} The reprojected extent, or null if the given extent is not an array of
 *   four numbers
 */
export function projExtent(fromProj, toProj, extent) {
    if (extent.length === 4) {
        const bottomLeft = proj4(fromProj.epsg, toProj.epsg, [extent[0], extent[1]])
        const topRight = proj4(fromProj.epsg, toProj.epsg, [extent[2], extent[3]])
        return [...bottomLeft, ...topRight].map(toProj.roundCoordinateValue)
    }
    return null
}

/**
 * Return an extent normalized to [[x, y], [x, y]] from a flat extent
 *
 * @param {Array} extent Extent to normalize
 * @returns {Array} Extent in the form [[x, y], [x, y]]
 */
export function normalizeExtent(extent) {
    let extentNormalized = extent
    if (extent?.length === 4) {
        // convert to the flat extent to [[x, y], [x, y]]
        extentNormalized = [
            [extent[0], extent[1]],
            [extent[2], extent[3]],
        ]
    } else if (extent?.length !== 2) {
        throw new Error(`Invalid extent: ${extent}`)
    }
    return extentNormalized
}

/**
 * Flatten extent
 *
 * @param {Array} extent Extent to flatten
 * @returns {Array} Flatten extent in from [minx, miny, maxx, maxy]
 */
export function flattenExtent(extent) {
    let flattenExtent = extent
    if (extent?.length === 2) {
        flattenExtent = [...extent[0], ...extent[1]]
    } else if (extent?.length !== 4) {
        throw new Error(`Invalid extent: ${extent}`)
    }
    return flattenExtent
}

/**
 * Get the intersection of the extent with the current projection, as a flatten extent expressed in
 * the current projection
 *
 * @param {[Number, Number, Number, Number] | [[Number, Number], [Number, Number]]} extent Such as
 *   [minx, miny, maxx, maxy]. or [bottomLeft, topRight]
 * @param {CoordinateSystem} extentProjection
 * @param {CoordinateSystem} currentProjection
 * @returns {[Number, Number, Number, Number] | null}
 */
export function getExtentIntersectionWithCurrentProjection(
    extent,
    extentProjection,
    currentProjection
) {
    if (
        (extent?.length !== 4 && extent?.length !== 2) ||
        !(extentProjection instanceof CoordinateSystem) ||
        !(currentProjection instanceof CoordinateSystem)
    ) {
        return null
    }
    let currentProjectionAsExtentProjection = currentProjection.bounds.flatten
    if (extentProjection.epsg !== currentProjection.epsg) {
        // we used to reproject the extent here, but there's problem arising if current projection is LV95 and
        // the extent is going a little bit out of Switzerland.
        // As LV95 is quite location-locked, the further we get, the bigger the mathematical errors start growing.
        // So to counteract that, we transform the current projection bounds in the extent projection to do the comparison.
        currentProjectionAsExtentProjection = projExtent(
            currentProjection,
            extentProjection,
            currentProjectionAsExtentProjection
        )
    }
    let finalExtent = getExtentIntersection(
        flattenExtent(extent),
        currentProjectionAsExtentProjection
    )
    if (
        !finalExtent ||
        // OL now populates the extent with Infinity when nothing is in common, instead returning a null value
        finalExtent.every((value) => Math.abs(value) === Infinity)
    ) {
        return null
    }
    if (extentProjection.epsg !== currentProjection.epsg) {
        // if we transformed the current projection extent above, we now need to output the correct proj
        finalExtent = projExtent(extentProjection, currentProjection, finalExtent)
    }

    return flattenExtent(finalExtent)
}

/**
 * @param {Number} config.size Number of pixels the extent should be (if s100 is given, a box of
 *   100x100 pixels with the coordinate at its center will be returned)
 * @param {[Number, Number]} config.coordinate Where the center of the "size" pixel(s) extent should
 *   be.
 * @param {CoordinateSystem} config.projection Projection used to describe the coordinates
 * @param {Number} config.resolution Current map resolution, necessary to calculate how much
 *   distance "size" pixel(s) means.
 * @param {Boolean} [config.rounded=false] Tells if the extent's value should be rounded before
 *   being returned. Default is `false`
 * @returns {[[Number, Number], [Number, Number]]} A squared extent of "size" pixel(s) around the
 *   given coordinates
 */
export function createPixelExtentAround(config) {
    const { size, coordinate, projection, resolution, rounded = false } = config
    if (!size || !coordinate || !projection || !resolution) {
        return null
    }
    let coordinatesWgs84 = coordinate
    if (projection.epsg !== WGS84.epsg) {
        coordinatesWgs84 = proj4(projection.epsg, WGS84.epsg, coordinate)
    }
    let extent = bbox(
        buffer(
            point(coordinatesWgs84),
            // sphere of the wanted number of pixels as radius around the coordinate
            size * resolution,
            { units: 'meters' }
        )
    )
    if (projection.epsg !== WGS84.epsg) {
        extent = [
            proj4(WGS84.epsg, projection.epsg, [extent[0], extent[1]]),
            proj4(WGS84.epsg, projection.epsg, [extent[2], extent[3]]),
        ]
    }
    extent = normalizeExtent(extent)
    if (rounded) {
        extent = extent.map((point) => [round(point[0]), round(point[1])])
    }
    return extent
}
