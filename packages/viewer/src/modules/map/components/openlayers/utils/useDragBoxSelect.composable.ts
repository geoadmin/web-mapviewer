import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminGeoJSONLayer, GPXLayer, KMLLayer } from '@swissgeo/layers'
import type { Geometry as TurfGeometry } from 'geojson'
import type {
    Geometry,
    GeometryCollection,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
} from 'ol/geom'

import { LayerType } from '@swissgeo/layers'
import log from '@swissgeo/log'
import {
    booleanIntersects,
    circle,
    lineString,
    multiLineString,
    multiPoint,
    multiPolygon,
    point,
    polygon,
} from '@turf/turf'
import { platformModifierKeyOnly } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import { DragBox } from 'ol/interaction'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE } from '@/config/map.config'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useMapStore, { type ClickInfo, ClickType } from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'
import { createLayerFeature } from '@/utils/layerUtils'

const dispatcher: ActionDispatcher = {
    name: 'useDragBoxSelect.composable',
}

export function useDragBoxSelect(): {
    dragBoxSelect: DragBox
} {
    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const mapStore = useMapStore()
    const positionStore = usePositionStore()

    const dragBoxSelect = new DragBox({
        condition: platformModifierKeyOnly,
    })

    dragBoxSelect.on('boxend', () => {
        const selectExtent = dragBoxSelect.getGeometry()?.getExtent()
        if (selectExtent?.length !== 4) {
            return
        }
        // Check if the box has a non-zero area
        const resolution = positionStore.resolution
        const minDragDistance = DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE * resolution
        const [minX, minY, maxX, maxY] = selectExtent
        const selectExtentCenter: SingleCoordinate = [(minX! + maxX!) / 2, (minY! + maxY!) / 2]
        if (
            Math.abs(minX! - maxX!) < minDragDistance ||
            Math.abs(minY! - maxY!) < minDragDistance
        ) {
            return
        }
        // Only clear selection if a real box was drawn
        featuresStore.clearAllSelectedFeatures(dispatcher)
        const dragBoxCoordinates = dragBoxSelect.getGeometry()?.getCoordinates()

        if (
            !Array.isArray(dragBoxCoordinates) ||
            !dragBoxCoordinates.every(
                (coord) =>
                    Array.isArray(coord) &&
                    coord.every(
                        (point) =>
                            Array.isArray(point) &&
                            point.length === 2 &&
                            point.every(Number.isFinite)
                    )
            )
        ) {
            log.error({
                title: 'useDragBoxSelect.composable',
                messages: ['Invalid dragBoxCoordinates:', dragBoxCoordinates],
            })
            return
        }

        const dragBox = polygon(dragBoxCoordinates as number[][][])
        const visibleLayers = layersStore.visibleLayers.filter((layer) =>
            [LayerType.GEOJSON, LayerType.GPX, LayerType.KML].includes(layer.type)
        )
        const vectorFeatures = visibleLayers
            .flatMap((layer) => {
                if (layer.type === LayerType.KML) {
                    const kmlFeatures = parseKml(
                        layer as KMLLayer,
                        positionStore.projection,
                        [],
                        positionStore.resolution
                    )
                    return kmlFeatures.map((feature) => ({ feature: feature, layer }))
                }
                if (layer.type === LayerType.GPX) {
                    const gpxData = (layer as GPXLayer).gpxData
                    if (!gpxData) {
                        return []
                    }
                    const gpxFeatures = parseGpx(gpxData, positionStore.projection)
                    return Array.isArray(gpxFeatures)
                        ? gpxFeatures.map((feature) => ({ feature: feature, layer }))
                        : []
                }
                if (layer.type === LayerType.GEOJSON) {
                    const geojsonFormat = new GeoJSON()
                    // Use type assertion to access geoJsonData
                    const geoJsonData = (layer as GeoAdminGeoJSONLayer).geoJsonData
                    if (!geoJsonData) {
                        return []
                    }
                    const olFeatures = geojsonFormat.readFeatures(geoJsonData, {
                        featureProjection: positionStore.projection.epsg,
                    })
                    return olFeatures.map((feature) => ({ feature: feature, layer }))
                }
                return []
            })
            .filter((result) => {
                const geometry = fromOlGeometryToTurfGeometry(result.feature.getGeometry())
                return geometry && dragBox && booleanIntersects(dragBox, geometry)
            })
            .map(({ feature, layer }) => createLayerFeature(feature, layer))

        mapStore.click(
            {
                coordinate: selectExtentCenter,
                features: vectorFeatures,
                clickType: ClickType.DrawBox,
            } as ClickInfo,
            dispatcher
        )
    })

    return {
        dragBoxSelect,
    }
}

/**
 * Converts an OpenLayers geometry object to a Turf.js geometry object.
 *
 * @param olGeometry - The OpenLayers geometry object to convert.
 * @returns The corresponding Turf.js geometry object, or undefined if the geometry type is not
 *   supported.
 */
function fromOlGeometryToTurfGeometry(olGeometry: Geometry | undefined): TurfGeometry | undefined {
    if (!olGeometry) {
        log.error({
            title: 'useDragBoxSelect.composable',
            messages: ['Invalid OpenLayers geometry provided.', 'undefined geometry'],
        })
        return undefined
    }

    const olGeometryType = olGeometry.getType()

    // Handle each geometry type specifically to avoid complex union types
    switch (olGeometryType) {
        case 'Point': {
            return point((olGeometry as Point).getCoordinates()).geometry
        }
        case 'MultiPoint': {
            return multiPoint((olGeometry as MultiPoint).getCoordinates()).geometry
        }
        case 'LineString': {
            return lineString((olGeometry as LineString).getCoordinates()).geometry
        }
        case 'MultiLineString': {
            return multiLineString((olGeometry as MultiLineString).getCoordinates()).geometry
        }
        case 'Polygon': {
            return polygon((olGeometry as Polygon).getCoordinates()).geometry
        }
        case 'MultiPolygon': {
            return multiPolygon((olGeometry as MultiPolygon).getCoordinates()).geometry
        }
        case 'GeometryCollection': {
            // GeometryCollection in OpenLayers contains other geometries, not coordinates
            // We need to recursively convert each geometry in the collection
            const olGeometryCollection = olGeometry as GeometryCollection
            const geometries = olGeometryCollection
                .getGeometries()
                .map(fromOlGeometryToTurfGeometry)
                .filter((geom): geom is TurfGeometry => !!geom)

            // Return a GeometryCollection directly
            return {
                type: 'GeometryCollection',
                geometries: geometries,
            } as TurfGeometry
        }
        case 'Circle': {
            const center = (olGeometry as Circle).getCenter()
            const radius = (olGeometry as Circle).getRadius()
            return circle(center as SingleCoordinate, radius).geometry
        }
        default:
            log.error({
                title: 'useDragBoxSelect.composable',
                messages: ['Unsupported geometry type:', olGeometryType],
            })
            return
    }
}
