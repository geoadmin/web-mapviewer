import type { SingleCoordinate } from '@geoadmin/coordinates'
import type { ExternalWMTSLayer, GeoAdminWMTSLayer, Layer } from '@geoadmin/layers'
import type { FeatureLike } from 'ol/Feature'

import { CoordinateSystem } from '@geoadmin/coordinates'
import { LayerType } from '@geoadmin/layers'
import { centroid } from '@turf/turf'
import GeoJSON, { type GeoJSONGeometry } from 'ol/format/GeoJSON'
import { SimpleGeometry } from 'ol/geom'
import RenderFeature from 'ol/render/Feature'

import LayerFeature from '@/api/features/LayerFeature.class.ts'
import { getBaseUrlOverride } from '@/config/baseUrl.config.ts'

import type { FlatExtent } from '../../../geoadmin-coordinates/src/extentUtils.ts'

/**
 * Minimalist description of an active layer. Is useful when parsing layers from the URL, but we do
 * not have searched them in the "real" layers config yet.
 *
 * Data contained by one of these is sufficient to find the matching layer (or build it from scratch
 * for external layers)
 */
export interface ActiveLayerConfig extends Partial<Layer> {}

/** Returns timestamp for WMS or WMTS layer from config data */
export function getTimestampFromConfig(layer: Layer): string | undefined {
    const timeEntry = layer.timeConfig?.currentTimeEntry
    if (!timeEntry && layer.type === LayerType.WMTS) {
        // for WMTS layer fallback to current
        return 'current'
    }
    return timeEntry?.timestamp
}

export function getWmtsXyzUrl(
    wmtsLayerConfig: GeoAdminWMTSLayer | ExternalWMTSLayer,
    projection: CoordinateSystem,
    options?: {
        /**
         * Flag telling if it is required to add the timestamp from the time config. When set to
         * `false` the timestamp is set to `{Time}` in the URL and needs to be processed later on
         * (usually by the mapping framework itself)
         */
        addTimestamp?: boolean
    }
): string | undefined {
    const { addTimestamp = false } = options ?? {}
    if (wmtsLayerConfig?.type === LayerType.WMTS && projection) {
        let timestamp: string = '{Time}'
        if (addTimestamp) {
            const timestampFromConfig = getTimestampFromConfig(wmtsLayerConfig)
            timestamp = timestampFromConfig ?? timestamp
        }
        const layerId = wmtsLayerConfig.isExternal
            ? wmtsLayerConfig.id
            : (wmtsLayerConfig as GeoAdminWMTSLayer).technicalName
        const format = wmtsLayerConfig.isExternal
            ? ((wmtsLayerConfig as ExternalWMTSLayer).options?.format ?? 'jpeg')
            : (wmtsLayerConfig as GeoAdminWMTSLayer).format
        return `${getBaseUrlOverride('wmts') ?? wmtsLayerConfig.baseUrl}1.0.0/${layerId}/default/${timestamp}/${projection.epsgNumber}/{z}/{x}/{y}.${format}`
    }
    return undefined
}

/**
 * Returns the index of the max resolution, which is used to determine the maximum zoom level
 * default to the array length
 */
export function indexOfMaxResolution(
    projection: CoordinateSystem,
    layerMaxResolution: number
): number {
    const resolutionSteps = projection.getResolutionSteps()
    const matchResolutionStep = resolutionSteps.find(
        (step) => step.resolution === layerMaxResolution
    )
    if (!matchResolutionStep) {
        return resolutionSteps.length - 1
    }
    return resolutionSteps.indexOf(matchResolutionStep)
}

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
    olFeature: FeatureLike,
    layer: Layer,
    coordinates?: SingleCoordinate,
    geometry?: GeoJSONGeometry
): LayerFeature | undefined {
    const olGeometry = olFeature?.getGeometry()
    if (
        !olGeometry ||
        geometry ||
        olGeometry instanceof RenderFeature ||
        !(olGeometry instanceof SimpleGeometry)
    ) {
        return
    }
    const geometryToReturn: GeoJSONGeometry =
        geometry ?? new GeoJSON().writeGeometryObject(olGeometry)
    // creating a centroid is especially important for Polygon geometries else it can break expected cesium behavior
    const center: SingleCoordinate | undefined = centroid(geometryToReturn).geometry
        .coordinates as SingleCoordinate

    return new LayerFeature({
        layer: layer,
        id: olFeature.getId() ?? layer.id,
        title:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track features don't have an ID but have a name!
            olFeature.get('name') ??
            olFeature.getId(),
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        center,
        geometry: geometryToReturn,
        extent: olGeometry.getExtent() as FlatExtent,
    })
}
