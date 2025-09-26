import { formatThousand, isNumber, round } from '@swissgeo/numbers'
import proj4 from 'proj4'

import { allCoordinateSystems, WGS84 } from '@/proj'
import CoordinateSystem from '@/proj/CoordinateSystem'

export type SingleCoordinate = [number, number]
export type Single3DCoordinate = [number, number, number]

function isValidCoordinate<T extends SingleCoordinate | SingleCoordinate[]>(input: T): boolean {
    if (!Array.isArray(input) || input.length === 0) {
        return false
    }
    const depthOne = input[0]
    if (Array.isArray(depthOne)) {
        return (input as SingleCoordinate[]).every((coordinate) => isValidCoordinate(coordinate))
    }
    return typeof input[0] === 'number' && typeof input[1] === 'number'
}

/**
 * Returns rounded coordinate with thousands separator and comma.
 *
 * @param coordinate The raw coordinate as array.
 * @param digits Decimal digits to round to.
 * @param [withThousandsSeparator=true] If thousands should be separated with a single quote
 *   character. Default is `true`
 * @param [enforceDigit=false] If set to true, we want to have that many figures after the period.
 *   Otherwise, we don't care. Default is `false`
 * @returns Formatted coordinate.
 * @see https://stackoverflow.com/a/2901298/4840446
 */
function toRoundedString(
    coordinate: SingleCoordinate,
    digits: number,
    withThousandsSeparator: boolean = true,
    enforceDigit: boolean = false
): string | undefined {
    if (
        !Array.isArray(coordinate) ||
        coordinate.length !== 2 ||
        !coordinate.every(isNumber) ||
        coordinate.some(
            (value) => value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY
        )
    ) {
        return
    }
    return coordinate
        .map((value) => {
            const roundedValue: number = round(value, digits)
            let stringValue: string
            if (enforceDigit) {
                stringValue = roundedValue.toFixed(digits)
            } else {
                stringValue = roundedValue.toString()
            }
            if (withThousandsSeparator) {
                return formatThousand(stringValue)
            }
            return stringValue
        })
        .join(', ')
}

/**
 * Wraps the provided coordinates in the world extents (i.e. the coordinate range that if equivalent
 * to the wgs84 [-180, 180])
 *
 * @param coordinates The coordinates (or array of coordinates) to wrap
 * @param projection Projection of the coordinates
 * @returns Coordinates wrapped on the X axis
 */
function wrapXCoordinates<T extends SingleCoordinate | SingleCoordinate[]>(
    coordinates: T,
    projection: CoordinateSystem
): T {
    if (projection.usesMercatorPyramid && projection.bounds && Array.isArray(coordinates)) {
        if (coordinates.length === 2 && coordinates.every(isNumber)) {
            const [x, y] = coordinates as SingleCoordinate
            if (x >= projection.bounds.lowerX && x <= projection.bounds.upperX) {
                return coordinates
            }
            const boundsWidth = projection.bounds.upperX - projection.bounds.lowerX
            const worldsAway = Math.floor((x - projection.bounds.lowerX) / boundsWidth)
            const offset = worldsAway * boundsWidth
            return [x - offset, y] as T
        } else if (coordinates.every(Array.isArray)) {
            return (coordinates as SingleCoordinate[]).map((coordinate) =>
                wrapXCoordinates(coordinate, projection)
            ) as T
        }
    }
    return coordinates
}

/**
 * Returns the coordinates unwrapped if they were placed into an extra array. This can happen when
 * dealing with GeoJSON coordinate, where some geometry types require coordinate in a format such as
 * [ [ [x,y], [x,y] ], [...feature2...] ]
 *
 * Most of our backends only deal with the first feature of such array, this function will unwrap
 * it, or return the array as is if it is not required
 */
function unwrapGeometryCoordinates(
    geometryCoordinates: SingleCoordinate[] | SingleCoordinate[][]
): SingleCoordinate[] {
    if (Array.isArray(geometryCoordinates)) {
        const [firstEntry] = geometryCoordinates
        if (Array.isArray(firstEntry) && !(typeof firstEntry[0] === 'number')) {
            return firstEntry as SingleCoordinate[]
        }
    }
    return geometryCoordinates as SingleCoordinate[]
}

/**
 * Remove any Z value from a set of coordinates
 *
 * @param coordinates
 */
function removeZValues(coordinates: SingleCoordinate[] | Single3DCoordinate[]): SingleCoordinate[] {
    if (Array.isArray(coordinates)) {
        if (coordinates.every((coordinate) => coordinate.length === 2)) {
            return coordinates
        } else if (coordinates.some((coordinate) => coordinate.length > 2)) {
            return coordinates.map((coordinate) => [coordinate[0], coordinate[1]])
        }
    }
    throw new Error('Invalid coordinates received, cannot remove Z values')
}

function reprojectAndRound<T extends SingleCoordinate | SingleCoordinate[]>(
    from: CoordinateSystem,
    into: CoordinateSystem,
    coordinates: T
): T {
    if (!from || !into) {
        throw new Error('Invalid arguments, must receive two CRS')
    }
    if (!isValidCoordinate(coordinates)) {
        throw new Error(
            'Invalid coordinates received, must be an array of number or an array of coordinates'
        )
    }
    const depthOne = coordinates[0]
    if (Array.isArray(depthOne)) {
        return (coordinates as SingleCoordinate[]).map((coordinate) =>
            reprojectAndRound(from, into, coordinate)
        ) as T
    }
    return proj4(from.epsg, into.epsg, coordinates as SingleCoordinate).map((value) =>
        into.roundCoordinateValue(value)
    ) as T
}

function parseCRS(crs?: string): CoordinateSystem | undefined {
    const epsgNumber = crs?.split(':').pop()
    if (!epsgNumber) {
        return
    }

    if (epsgNumber === 'WGS84') {
        return WGS84
    }
    return allCoordinateSystems.find((system) => system.epsg === `EPSG:${epsgNumber}`)
}

export interface GeoadminCoordinatesUtils {
    toRoundedString: typeof toRoundedString
    wrapXCoordinates: typeof wrapXCoordinates
    unwrapGeometryCoordinates: typeof unwrapGeometryCoordinates
    removeZValues: typeof removeZValues
    reprojectAndRound: typeof reprojectAndRound
    parseCRS: typeof parseCRS
}

const coordinatesUtils: GeoadminCoordinatesUtils = {
    toRoundedString,
    wrapXCoordinates,
    unwrapGeometryCoordinates,
    removeZValues,
    reprojectAndRound,
    parseCRS,
}
export { coordinatesUtils }
export default coordinatesUtils
