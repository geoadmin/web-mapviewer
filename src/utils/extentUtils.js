import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { point } from '@turf/helpers'
import { getIntersection as getExtentIntersection, isEmpty as isExtentEmpty } from 'ol/extent'
import proj4 from 'proj4'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { normalizeExtent, projExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'

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

/**
 * @param {Number} config.size Number of pixels the extent should be (if 100 is given, a box of
 *   100x100 pixels with the coordinate at its center will be returned)
 * @param {[Number, Number]} config.coordinate Where the center of the 100pixel extent should be.
 * @param {CoordinateSystem} config.projection Projection used to describe the coordinates
 * @param {Number} config.resolution Current map resolution, necessary to calculate how much
 *   distance 100pixel means.
 * @param {Boolean} [config.rounded=false] Tells if the extent's value should be rounded before
 *   being returned. Default is `false`
 * @returns {[[Number, Number], [Number, Number]]} A squared extent of 100pixel around the given
 *   coordinates
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
