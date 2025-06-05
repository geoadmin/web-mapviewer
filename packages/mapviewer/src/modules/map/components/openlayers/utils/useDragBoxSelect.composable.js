import log from '@geoadmin/log'
import {
    booleanIntersects,
    circle,
    geometryCollection,
    lineString,
    multiLineString,
    multiPoint,
    multiPolygon,
    point,
    polygon,
} from '@turf/turf'
import { platformModifierKeyOnly } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import { DragBox } from 'ol/interaction'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import { DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE } from '@/config/map.config'
import { ClickInfo } from '@/store/modules/map.store'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'
import { createLayerFeature } from '@/utils/layerUtils'

const dispatcher = {
    dispatcher: 'useDragBoxSelect.composable',
}

export function useDragBoxSelect() {
    const store = useStore()

    const dragBoxSelect = new DragBox({
        condition: platformModifierKeyOnly,
    })

    dragBoxSelect.on('boxend', () => {
        const selectExtent = dragBoxSelect.getGeometry()?.getExtent()
        if (selectExtent?.length !== 4) {
            return
        }
        // Check if the box has a non-zero area
        const resolution = store.getters.resolution
        const minDragDistance = DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE * resolution
        const [minX, minY, maxX, maxY] = selectExtent
        if (Math.abs(minX - maxX) < minDragDistance || Math.abs(minY - maxY) < minDragDistance) {
            return
        }
        // Only clear selection if a real box was drawn
        store.dispatch('clearAllSelectedFeatures', { ...dispatcher })
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
            log.error('Invalid dragBoxCoordinates:', dragBoxCoordinates)
            return
        }

        const dragBox = polygon(dragBoxCoordinates)
        const visibleLayers = store.getters.visibleLayers.filter((layer) =>
            [LayerTypes.GEOJSON, LayerTypes.GPX, LayerTypes.KML].includes(layer.type)
        )
        const vectorFeatures = visibleLayers
            .flatMap((layer) => {
                if (layer.type === LayerTypes.KML) {
                    const kmlFeatures = parseKml(layer, store.state.position.projection, [])
                    return kmlFeatures.map((feature) => ({ feature: feature, layer }))
                }
                if (layer.type === LayerTypes.GPX) {
                    const gpxFeatures = parseGpx(layer.gpxData, store.state.position.projection, [])
                    return gpxFeatures.map((feature) => ({ feature: feature, layer }))
                }
                if (layer.type === LayerTypes.GEOJSON) {
                    const geojsonFormat = new GeoJSON()
                    const olFeatures = geojsonFormat.readFeatures(layer.geoJsonData, {
                        featureProjection: store.state.position.projection.epsg,
                    })
                    return olFeatures.map((feature) => ({ feature: feature, layer }))
                }
            })
            .filter((result) => {
                const geometry = fromOlGeometryToTurfGeometry(result.feature.getGeometry())
                return geometry && dragBox && booleanIntersects(dragBox, geometry)
            })
            .map(({ feature, layer }) => createLayerFeature(feature, layer))

        store.dispatch('click', {
            clickInfo: new ClickInfo({ coordinate: selectExtent, features: vectorFeatures }),
            ...dispatcher,
        })
    })

    return {
        dragBoxSelect,
    }
}

/**
 * Converts an OpenLayers geometry object to a Turf.js geometry object.
 *
 * @param {ol.geom.Geometry} olGeometry - The OpenLayers geometry object to convert.
 * @returns {Object | null} The corresponding Turf.js geometry object, or null if the geometry type
 *   is not supported.
 */
function fromOlGeometryToTurfGeometry(olGeometry) {
    if (!olGeometry || typeof olGeometry.getCoordinates !== 'function') {
        log.error('Invalid OpenLayers geometry provided.', olGeometry)
        return null
    }

    // Mapping OpenLayers geometry types to Turf.js functions
    const geometryMapping = {
        Point: point,
        MultiPoint: multiPoint,
        LineString: lineString,
        MultiLineString: multiLineString,
        Polygon: polygon,
        MultiPolygon: multiPolygon,
        GeometryCollection: geometryCollection,
        Circle: function (olGeometry) {
            const center = olGeometry.getCenter()
            const radius = olGeometry.getRadius()
            return circle(center, radius)
        },
    }

    const olGeometryType = olGeometry.getType()

    const turfGeometryFunction = geometryMapping[olGeometryType]

    if (turfGeometryFunction) {
        return turfGeometryFunction(olGeometry.getCoordinates())
    } else {
        log.error('Unsupported geometry type:', olGeometryType)
        return null
    }
}
