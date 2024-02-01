import {
    createEmpty as emptyExtent,
    extend as extendExtent,
    isEmpty as isExtentEmpty,
} from 'ol/extent'
import KML from 'ol/format/KML'

import { EditableFeature } from '@/api/features.api.js'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

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
 * Parses a KML's data into OL Features, including deserialization of features
 *
 * @param {String} kmlData KML content to parse
 * @param {CoordinateSystem} projection Projection to use for the OL Feature
 * @param {DrawingIconSet[]} iconSets Icon sets to use for EditabeFeature deserialization
 * @returns {ol/Feature[]} List of OL Features
 */
export function parseKml(kmlData, projection, iconSets) {
    const features = new KML().readFeatures(kmlData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((olFeature) => {
        EditableFeature.fromOlFeature(olFeature, iconSets, projection)
    })

    return features
}

/**
 * Get KML extent
 *
 * @param {string} content KML content
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

export class EmptyKMLError extends Error {}
