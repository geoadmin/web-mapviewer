import { getIntersection as getExtentIntersection, isEmpty as isExtentEmpty } from 'ol/extent'

import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { normalizeExtent, projExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

/**
 * Get a flattened extent for the projection bounds.
 *
 * @param {CoordinateSystem} projection Projection in which to get the extent
 * @param {[minx, miny, maxx, maxy]} extent Extent in WGS84
 * @returns {null | [[minx, miny], [maxx, maxy]]} Return null if the extent is out of projection
 *   bounds or the intersection between the extent and projection bounds. The return extent is
 *   re-projected to the projection
 */
export function getExtentForProjection(projection, extent) {
    const projectionBounds = projection.getBoundsAs(WGS84).flatten
    let intersectExtent = getExtentIntersection(projectionBounds, extent)
    log.debug(
        `Get extent for projection ${projection.epsg}`,
        `kmlExtent=${extent}`,
        `projectionBounds=${projectionBounds}`,
        `intersectExtent=${intersectExtent}`
    )
    if (!isExtentEmpty(intersectExtent)) {
        return normalizeExtent(projExtent(WGS84, projection, intersectExtent))
    }
    return null
}
