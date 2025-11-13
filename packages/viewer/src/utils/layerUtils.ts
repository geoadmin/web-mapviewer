import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { Feature } from 'ol'
import type { FeatureLike } from 'ol/Feature'

import { LayerType } from '@swissgeo/layers'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { randomIntBetween } from '@swissgeo/numbers'
import { centroid } from '@turf/turf'
import GeoJSON, { type GeoJSONGeometry } from 'ol/format/GeoJSON'
import RenderFeature from 'ol/render/Feature'

import type { LayerFeature } from '@/api/features.api'

/**
 * Creates a LayerFeature object from an OpenLayers feature and a layer.
 *
 * @param olFeature The OpenLayers feature to convert.
 * @param layer The layer associated with the feature.
 * @param coordinates
 * @param geometry
 * @returns The created LayerFeature object or undefined if the feature has no geometry.
 */
export function createLayerFeature(
    olFeature: FeatureLike | Feature,
    layer: Layer,
    coordinates?: SingleCoordinate,
    geometry?: GeoJSONGeometry
): LayerFeature | undefined {
    const olFeatureGeometry = olFeature.getGeometry()
    if (!olFeatureGeometry || olFeatureGeometry instanceof RenderFeature) {
        return
    }
    const geometryToReturn: GeoJSONGeometry =
        geometry ?? new GeoJSON().writeGeometryObject(olFeatureGeometry)
    const featureId: string = olFeature.getId()
        ? `${olFeature.getId()}`
        : `$feature-${randomIntBetween(1000, 9999)}-${layer.id}`

    let featureCoordinates: SingleCoordinate | undefined
    // creating a centroid is especially important for Polygon geometries else it can break expected cesium behavior
    if (
        ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometryToReturn.type)
    ) {
        featureCoordinates = centroid(geometryToReturn).geometry.coordinates as SingleCoordinate
    } else if (geometryToReturn.type === 'Point') {
        featureCoordinates = geometryToReturn.coordinates as SingleCoordinate
    } else {
        featureCoordinates = coordinates
    }
    if (!featureCoordinates) {
        log.error({
            title: 'layerUtils',
            titleColor: LogPreDefinedColor.Pink,
            messages: ['Could not detect layer feature coordinates', olFeatureGeometry],
        })
        return
    }

    return {
        isEditable: false,
        layer: layer,
        id: featureId,
        title:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track features don't have an ID but have a name!
            olFeature.get('name') ??
            featureId,
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        coordinates: featureCoordinates,
        geometry: geometryToReturn,
        extent: olFeatureGeometry.getExtent() as FlatExtent,
        popupDataCanBeTrusted: !layer.isExternal && layer.type !== LayerType.KML,
    }
}
