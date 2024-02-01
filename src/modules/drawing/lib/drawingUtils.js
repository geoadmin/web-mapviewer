import { wrapX } from 'ol/coordinate'
import { LineString, Polygon } from 'ol/geom'
import { get as getProjection } from 'ol/proj'

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
