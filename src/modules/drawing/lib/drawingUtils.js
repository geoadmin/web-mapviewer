import { CoordinateSystems } from '@/utils/coordinateUtils'
import { format } from '@/utils/numberUtils'
import { LineString, Point, Polygon } from 'ol/geom'
import proj4 from 'proj4'
import { wrapX as wrapXCoordinate } from 'ol/coordinate'
import { get as getProjection } from 'ol/proj'

export function toLv95(input, epsg) {
    if (Array.isArray(input[0])) {
        return input.map((si) => toLv95(si, epsg))
    } else {
        return proj4(epsg, CoordinateSystems.LV95.epsg, [input[0], input[1]])
    }
}

/**
 * Wraps the provided webmercator coordinates in the world extents (i.e. the coordinate range
 * that if equivalent to the wgs84 [-180, 180))
 *
 * @param coords The coordinates (or array of coordinates) to wrap
 * @param inPlace If false, the original coordinates remain untouched and only a copy is modified
 * @returns If "inPlace", then the same reference as "coords", else a reference to the modified copy
 */
export function wrapWebmercatorCoords(coords, inPlace = false) {
    if (inPlace) {
        if (Array.isArray(coords[0])) {
            coords.forEach((coords) => wrapWebmercatorCoords(coords, true))
            return coords
        } else {
            return wrapXCoordinate(coords, getProjection(CoordinateSystems.WEBMERCATOR.epsg))
        }
    } else {
        return Array.isArray(coords[0])
            ? coords.map((coords) => wrapWebmercatorCoords(coords, false))
            : wrapXCoordinate(coords.slice(), getProjection(CoordinateSystems.WEBMERCATOR.epsg))
    }
}

/** @param {[number, number]} coo Coordinates */
export function formatPointCoordinates(coo) {
    return `${format(coo[0], 0)}, ${format(coo[1], 0)}`
}

export function formatMeters(value, { dim = 1, digits = 2, applyFormat = true } = {}) {
    const factor = Math.pow(1000, dim)
    let unit = dim === 1 ? 'm' : 'm²'
    if (value >= factor) {
        unit = dim === 1 ? 'km' : 'km²'
        value /= factor
    }
    value = applyFormat ? format(value, digits) : value.toFixed(digits)
    return `${value} ${unit}`
}

export function geometryInfo(type, coordinates, epsg) {
    const coos95 = toLv95(coordinates, epsg)
    const output = {
        type,
    }
    if (type === Point) {
        output.location = formatPointCoordinates(coos95)
    } else {
        if (type === Polygon) {
            const poly = new Polygon(coos95)
            output.area = formatMeters(poly.getArea(), { dim: 2 })
            const line = new LineString(coos95[0])
            output.perimeter = formatMeters(line.getLength())
        } else {
            const line = new LineString(coos95)
            output.length = formatMeters(line.getLength())
        }
    }
    return output
}

/**
 * Formats minutes to hours and minutes (if more than one hour) e.g. 1230 -> '20h 30min', 55 ->
 * '55min'
 *
 * @param {Number} minutes
 * @returns {string}
 */
export function formatTime(minutes) {
    if (isNaN(minutes) || minutes === null) {
        return '-'
    }
    let result = ''
    if (minutes >= 60) {
        let hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        result += `${hours}h`
        if (minutes > 0) {
            result += ` ${minutes}min`
        }
    } else {
        result += `${minutes}min`
    }
    return result
}

export function formatAngle(value, digits = 2) {
    return `${value.toFixed(digits)}°`
}

export function extractOpenLayersFeatureCoordinates(feature) {
    let coordinates = feature.getGeometry().getCoordinates()
    if (feature.getGeometry().getType() === 'Polygon') {
        // in case of a polygon, the coordinates structure is
        // [
        //   [ (poly1)
        //      [coord1],[coord2]
        //   ],
        //   [ (poly2) ...
        // ]
        // so as we will not have multipoly, we only keep what's defined as poly one
        // (we remove the wrapping array that would enable us to have a second polygon)
        coordinates = coordinates[0]
    }
    return coordinates
}

/**
 * Checks if point is at target within tolerance.
 *
 * @param {Number[]} point The point in question.
 * @param {Number[]} target The target to check against.
 * @param {Number} [tolerance=0] Distance from target that still counts. Default is `0`
 * @returns {Boolean} If the point is close enough to the target.
 */
export function pointWithinTolerance(point, target, tolerance = 0) {
    if (!point || !target) {
        return false
    }

    return (
        point[0] >= target[0] - tolerance &&
        point[0] <= target[0] + tolerance &&
        point[1] >= target[1] - tolerance &&
        point[1] <= target[1] + tolerance
    )
}

/**
 * Extracts and normalizes coordinates from LineStrings and Polygons.
 *
 * @param {ol.Feature} feature The feature to extract from.
 * @returns {Number[][]} An array of coordinates.
 */
export function getVertexCoordinates(feature) {
    let normalized = []
    const geometry = feature?.getGeometry()

    if (geometry) {
        const coordinates = geometry.getCoordinates()

        if (geometry instanceof LineString) {
            normalized = coordinates
        } else if (geometry instanceof Polygon) {
            normalized = coordinates[0]
        }
    }

    return normalized
}
