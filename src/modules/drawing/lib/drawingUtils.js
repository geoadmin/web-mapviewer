import { LineString, Polygon } from 'ol/geom'

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
