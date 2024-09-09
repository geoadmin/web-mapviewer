import { wrapX } from 'ol/coordinate'
import { get as getProjection } from 'ol/proj'
import proj4 from 'proj4'

import { formatThousand } from '../numberUtils'
import { LV95 } from './coordinateSystems'

/**
 * Returns rounded coordinate with thousands separator and comma.
 *
 * @param {[Number, Number]} coordinate The raw coordinate as array.
 * @param {Number} digits Decimal digits to round to.
 * @param {Boolean} withThousandsSeparator If thousands should be separated with a single quote
 *   character
 * @returns {String} Formatted coordinate.
 * @see https://stackoverflow.com/a/2901298/4840446
 */
export function toRoundedString(coordinate, digits, withThousandsSeparator = true) {
    return coordinate
        .map((value) => value.toFixed(digits))
        .map((value) => (withThousandsSeparator ? formatThousand(value) : value))
        .join(', ')
        .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

/**
 * Projection of an extent, described as [topLeftX, topLeftY, bottomRightX, bottomRightY]
 *
 * @param {CoordinateSystem} fromProj Current projection used to describe the extent
 * @param {CoordinateSystem} toProj Target projection we want the extent be expressed in
 * @param {Number[]} extent An extent, described as `[topLeftX, topLeftY, bottomRightX,
 *   bottomRightY]`
 * @returns {null | Number[]} The reprojected extent, or null if the given extent is not an array of
 *   four numbers
 */
export function projExtent(fromProj, toProj, extent) {
    if (extent.length === 4) {
        const topLeft = proj4(fromProj.epsg, toProj.epsg, [extent[0], extent[1]])
        const bottomRight = proj4(fromProj.epsg, toProj.epsg, [extent[2], extent[3]])
        return [...topLeft, ...bottomRight].map(toProj.roundCoordinateValue)
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

/** Coordinates or extent out of bounds error */
export class OutOfBoundsError extends Error {
    constructor(message) {
        super(message)
        this.name = 'OutOfBoundsError'
    }
}

/**
 * Convert recursively input coordinates into LV95
 *
 * @param {[]} input Coordinate of a point, multipoint or polygon
 * @param {String} epsg EPSG code of the coordinates
 * @returns {[]} Reprojected coordinates
 */
export function toLv95(input, epsg) {
    if (Array.isArray(input[0])) {
        return input.map((si) => toLv95(si, epsg))
    } else {
        return proj4(epsg, LV95.epsg, [input[0], input[1]])
    }
}

/**
 * Wraps the provided coordinates in the world extents (i.e. the coordinate range that if equivalent
 * to the wgs84 [-180, 180))
 *
 * @param {Array} coordinates The coordinates (or array of coordinates) to wrap
 * @param {CoordinateSystem} projection Projection of the coordinates
 * @param {boolean} inPlace If false, the original coordinates remain untouched and only a copy is
 *   modified
 * @returns If "inPlace", then the same reference as "coords", else a reference to the modified copy
 */
export function wrapXCoordinates(coordinates, projection, inPlace = false) {
    let wrappedCoords = coordinates
    if (!inPlace) {
        wrappedCoords = wrappedCoords.slice()
    }
    if (Array.isArray(wrappedCoords[0])) {
        return wrappedCoords.map((c) => wrapXCoordinates(c, projection, inPlace))
    }
    return wrapX(wrappedCoords, getProjection(projection.epsg))
}

/**
 * Returns the coordinates unwrapped if they were placed into an extra array. This can happen when
 * dealing with GeoJSON coordinate, where some geometry types require coordinate in a format such as
 * [ [ [x,y], [x,y] ], [...feature2...] ]
 *
 * Most of our backends only deal with the first feature of such array, this function will unwrap
 * it, or return the array as is if it is not required
 *
 * @param {Array} geometryCoordinates
 */
export function unwrapGeometryCoordinates(geometryCoordinates) {
    if (Array.isArray(geometryCoordinates)) {
        const [firstEntry] = geometryCoordinates
        if (Array.isArray(firstEntry) && !(typeof firstEntry[0] === 'number')) {
            return firstEntry
        }
    }
    return geometryCoordinates
}

/**
 * Remove any Z value from a set of coordinates
 *
 * @param {[[Number, Number]] | [[Number, Number, Number]]} coordinates
 * @returns {[[Number, Number]] | null}
 */
export function removeZValues(coordinates) {
    const unwrapped = unwrapGeometryCoordinates(coordinates)
    if (!Array.isArray(unwrapped) || !unwrapped.some((coordinate) => coordinate.length > 2)) {
        return coordinates
    }
    return unwrapped.map((coordinate) => [coordinate[0], coordinate[1]])
}

/**
 * @param {CoordinateSystem} from
 * @param {CoordinateSystem} into
 * @param {[Number, Number]} coordinates
 * @returns {[Number, Number] | null}
 */
export function reprojectAndRound(from, into, coordinates) {
    if (!from || !into || !Array.isArray(coordinates)) {
        return null
    }
    return proj4(from.epsg, into.epsg, coordinates).map(into.roundCoordinateValue)
}
