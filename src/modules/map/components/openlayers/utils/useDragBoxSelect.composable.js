import { booleanIntersects } from '@turf/boolean-intersects'
import { lineString, point, polygon } from '@turf/helpers'
import { platformModifierKeyOnly } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Point, Polygon } from 'ol/geom'
import { DragBox } from 'ol/interaction'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
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

    dragBoxSelect.on('boxstart', () =>
        store.dispatch('clearAllSelectedFeatures', { ...dispatcher })
    )
    dragBoxSelect.on('boxend', () => {
        const selectExtent = dragBoxSelect.getGeometry()?.getExtent()
        if (selectExtent?.length !== 4) return

        const dragBox = polygon(dragBoxSelect.getGeometry()?.getCoordinates())
        const visibleLayers = store.getters.visibleLayers.filter((layer) =>
            [LayerTypes.GEOJSON, LayerTypes.GPX, LayerTypes.KML].includes(layer.type)
        )
        const features = visibleLayers
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
            clickInfo: new ClickInfo({ coordinate: selectExtent, features: features }),
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
    if (olGeometry instanceof Point) {
        return point(olGeometry.getCoordinates())
    }
    if (olGeometry instanceof Polygon) {
        return polygon(olGeometry.getCoordinates())
    }
    if (olGeometry instanceof LineString) {
        return lineString(olGeometry.getCoordinates())
    }
    return null
}
