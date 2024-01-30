import { gpxStyle } from '@/modules/drawing/lib/style.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems.js'
import GPX from '@/utils/GPX.js'

/**
 * Parses a GPX's data into OL Features, including deserialization of features
 *
 * @param {String} gpxData KML content to parse
 * @param {CoordinateSystem} projection Projection to use for the OL Feature
 * @returns {ol/Feature[]} List of OL Features
 */
export function parseGpx(gpxData, projection) {
    const features = new GPX().readFeatures(gpxData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((feature) => {
        feature.setStyle(gpxStyle)
    })
    return features
}
