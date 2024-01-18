import {
    createEmpty as emptyExtent,
    extend as extendExtent,
    getIntersection as getExtentIntersection,
    isEmpty as isExtentEmpty,
} from 'ol/extent'
import KML from 'ol/format/KML'

import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { normalizeExtent, projExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

/**
 * Read the KML name
 *
 * @param {string} content Kml content
 * @returns {string} Return KML name
 */
export function parseKmlName(content) {
    const kml = new KML()

    return kml.readName(content)
}

/**
 * Get KML extent
 *
 * @param {string} conetnt KML content
 * @returns {ol/extent|null} KML layer extent in WGS84 projection or null if the KML has no features
 */
export function getKmlExtent(content) {
    const kml = new KML()
    const features = kml.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const extent = emptyExtent()
    features.forEach((feature) => {
        extendExtent(extent, feature.getGeometry().getExtent())
    })
    if (isExtentEmpty(extent)) {
        return null
    }
    return extent
}

/**
 * Get KML extent for the projection bounds.
 *
 * @param {CoordinateSystem} projection Projection in which to get the KML extent
 * @param {[minx, miny, maxx, maxy]} kmlExtent KML extent in WGS84
 * @returns {null | [[minx, miny], [maxx, maxy]]} Return null if the KML is out of projection bounds
 *   or the intersect extent between KML and projection bounds. The return extent is re-projected to
 *   the projection
 */
export function getKmlExtentForProjection(projection, extent) {
    const projectionBounds = projection.getBoundsAs(WGS84).flatten
    let intersectExtent = getExtentIntersection(projectionBounds, extent)
    log.debug(
        `Get KML extent for projection ${projection.epsg}, ` +
            `kmlExtent=${extent}, projectionBounds=${projectionBounds}, intersectExtent=${intersectExtent}`
    )
    if (!isExtentEmpty(intersectExtent)) {
        return normalizeExtent(projExtent(WGS84, projection, intersectExtent))
    }
    return null
}

export class EmptyKMLError extends Error {}
