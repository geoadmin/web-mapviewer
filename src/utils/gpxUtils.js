import { gpx as gpxToGeoJSON } from '@mapbox/togeojson'
import bbox from '@turf/bbox'
import { isEmpty as isExtentEmpty } from 'ol/extent'
import GPX from 'ol/format/GPX'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { gpxStyles } from '@/utils/styleUtils'

/**
 * Parse the GPX extent from the GPX tracks or features
 *
 * Will return null if the extent is not parsable.
 *
 * @param {String} content GPX content as a string
 * @returns {[number, number, number, number] | null}
 */
export function getGpxExtent(content) {
    const parseGpx = new DOMParser().parseFromString(content, 'text/xml')
    const extent = bbox(gpxToGeoJSON(parseGpx))
    if (isExtentEmpty(extent)) {
        return null
    }
    return extent
}

/**
 * Parses a GPX's data into OL Features, including deserialization of features
 *
 * @param {String} gpxData KML content to parse
 * @param {CoordinateSystem} projection Projection to use for the OL Feature
 * @returns {ol/Feature[]|null} List of OL Features, or null of the gpxData or projection is
 *   invalid/empty
 */
export function parseGpx(gpxData, projection) {
    if (!gpxData?.length || !(projection instanceof CoordinateSystem)) {
        return null
    }
    // currently points which contain a timestamp are displayed with an offset due to a bug
    // therefore they are removed here as they are not needed for displaying (see PB-785)
    gpxData = gpxData.replace(/<time>.*?<\/time>/g, '')
    const features = new GPX().readFeatures(gpxData, {
        dataProjection: WGS84.epsg, // GPX files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((feature) => {
        const geom = feature.getGeometry()
        // PB-800 : to avoid a coastline paradox we simplify the geometry of GPXs
        // 12.5 meters is what was used in the old viewer, see https://github.com/geoadmin/mf-geoadmin3/blob/ce24a27b0ca8192a0f78f7b8cc07f4e231031304/src/components/GeomUtilsService.js#L207
        feature.setGeometry(geom.simplify(12.5))
        feature.setStyle(gpxStyles[geom.getType()])
    })
    return features
}

export class EmptyGPXError extends Error {}
