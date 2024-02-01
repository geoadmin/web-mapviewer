import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import GPX from '@/utils/GPX'
import { gpxStyle } from '@/utils/styleUtils'

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
    const features = new GPX().readFeatures(gpxData, {
        dataProjection: WGS84.epsg, // GPX files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((feature) => {
        feature.setStyle(gpxStyle)
    })
    return features
}

export class EmptyGPXError extends Error {}
