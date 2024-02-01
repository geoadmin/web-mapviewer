import { getIntersection as getExtentIntersection, isEmpty as isExtentEmpty } from 'ol/extent'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { normalizeExtent, projExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

/**
 * Get a flattened extent for the projection bounds.
 *
 * @param {CoordinateSystem} projection Projection in which to get the extent
 * @param {[number, number, number, number]} extent Extent in WGS84 such as `[minx, miny, maxx,
 *   maxy]`
 * @returns {null | [[number, number], [number, number]]} Return null if the extent is out of
 *   projection bounds or the intersection between the extent and projection bounds. The return
 *   extent is re-projected to the projection. The output format will be `[[minx, miny], [maxx,
 *   maxy]]`.
 */
export function getExtentForProjection(projection, extent) {
    if (!(projection instanceof CoordinateSystem) || extent?.length !== 4) {
        return null
    }
    const projectionBounds = projection.getBoundsAs(WGS84).flatten
    let intersectExtent = getExtentIntersection(projectionBounds, extent)
    log.debug(
        `Get extent for projection ${projection.epsg}`,
        `extent=${extent}`,
        `projectionBounds=${projectionBounds}`,
        `intersectExtent=${intersectExtent}`
    )
    if (!isExtentEmpty(intersectExtent)) {
        return normalizeExtent(projExtent(WGS84, projection, intersectExtent))
    }
    return null
}
