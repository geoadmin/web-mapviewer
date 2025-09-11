import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Point, Polygon } from 'ol/geom'

import {
    extractOlFeatureCoordinates,
    extractOlFeatureGeodesicCoordinates,
} from '@/api/features/features.api'

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
        } else if (geometry instanceof Point) {
            normalized = [coordinates]
        } else if (geometry instanceof Polygon) {
            normalized = coordinates[0]
        }
    }

    return normalized
}
/**
 * Update the store feature with the new coordinates.
 *
 * @param {Store} store The Vuex store.
 * @param {ol.Feature} feature The feature to extract from.
 * @param {string} dispatcher The dispatcher object.
 * @param {Boolean} [reverse=false] If the coordinates should be reversed. Default is `false`
 */
export function updateStoreFeatureCoordinatesGeometry(store, feature, dispatcher, reverse = false) {
    const storeFeature = feature.get('editableFeature')
    if (reverse) {
        feature.getGeometry().setCoordinates(feature.getGeometry().getCoordinates().reverse())
    }
    store.dispatch('changeFeatureCoordinates', {
        feature: storeFeature,
        coordinates: extractOlFeatureCoordinates(feature),
        geodesicCoordinates: extractOlFeatureGeodesicCoordinates(feature),
        ...dispatcher,
    })
    store.dispatch('changeFeatureGeometry', {
        feature: storeFeature,
        geometry: new GeoJSON().writeGeometryObject(feature.getGeometry()),
        ...dispatcher,
    })
}
