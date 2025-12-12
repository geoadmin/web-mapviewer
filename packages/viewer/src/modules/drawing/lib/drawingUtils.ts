import type { SingleCoordinate } from '@swissgeo/coordinates'
import type Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'

import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Point, Polygon } from 'ol/geom'

import type { ActionDispatcher } from '@/store/types'

import { extractOlFeatureCoordinates } from '@/api/features.api'
import useDrawingStore from '@/store/modules/drawing'

/**
 * Checks if point is at target within tolerance.
 *
 * @param point The point in question.
 * @param target The target to check against.
 * @param tolerance Distance from target that still counts. Default is `0`
 * @returns If the point is close enough to the target.
 */
export function pointWithinTolerance(
    point: SingleCoordinate,
    target: SingleCoordinate,
    tolerance: number = 0
): boolean {
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
 * @param feature The feature to extract from.
 * @returns An array of coordinates.
 */
export function getVertexCoordinates(feature: Feature<SimpleGeometry>): SingleCoordinate[] {
    let normalized: SingleCoordinate[] = []
    const geometry = feature.getGeometry()

    if (geometry) {
        const coordinates = geometry.getCoordinates()
        if (geometry instanceof LineString) {
            normalized = coordinates as SingleCoordinate[]
        } else if (geometry instanceof Point) {
            normalized = [coordinates as SingleCoordinate]
        } else if (geometry instanceof Polygon && Array.isArray(coordinates)) {
            normalized = coordinates[0] as SingleCoordinate[]
        }
    }

    return normalized
}
/**
 * Update the store feature with the new coordinates.
 *
 * @param feature The feature to extract from.
 * @param dispatcher The dispatcher object.
 * @param reverse If the coordinates should be reversed. Default is `false`
 */
export function updateStoreFeatureCoordinatesGeometry(
    feature: Feature<SimpleGeometry>,
    dispatcher: ActionDispatcher,
    reverse: boolean = false
) {
    const featureGeometry = feature.getGeometry()
    const featureCoordinates = featureGeometry?.getCoordinates()
    if (!featureGeometry || !featureCoordinates) {
        return
    }
    if (reverse) {
        featureGeometry.setCoordinates(featureCoordinates.reverse())
    }
    const drawingStore = useDrawingStore()
    drawingStore.updateCurrentDrawingFeature(
        {
            coordinates: extractOlFeatureCoordinates(feature),
            geometry: new GeoJSON().writeGeometryObject(featureGeometry),
        },
        dispatcher
    )
}
