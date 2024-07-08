import { gpx as gpxToGeoJSON } from '@mapbox/togeojson'
import bbox from '@turf/bbox'
import { isEmpty as isExtentEmpty } from 'ol/extent'

import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import GPX from '@/utils/ol/format/GPX'
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
    console.error(JSON.stringify(gpxData, null, 2))
    console.error('projections: ', WGS84.epsg, projection.epsg)
    const features = new GPX().readFeatures(gpxData, {
        dataProjection: WGS84.epsg, // GPX files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((feature) => {
        feature.setStyle(gpxStyles[feature.getGeometry().getType()])
        console.error(feature.getGeometry())
        console.error(feature.getGeometry().getType())
    })
    return features
}

export class EmptyGPXError extends Error {}
