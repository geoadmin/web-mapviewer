import GeoJSON from 'ol/format/GeoJSON'

import LayerFeature from '@/api/features/LayerFeature.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getBaseUrlOverride } from '@/config/baseUrl.config'
import { normalizeExtent } from '@/utils/extentUtils'

/**
 * Minimalist description of an active layer. Is useful when parsing layers from the URL, but we do
 * not have searched them in the "real" layers config yet.
 *
 * Data contained by one of these is sufficient to find the matching layer (or build it from scratch
 * for external layers)
 *
 * @typedef ActiveLayerConfig
 * @property {String} id The layer ID
 * @property {LayerTypes} [type] The layer type (for external layers)
 * @property {Boolean} [visible] Flag telling if the layer should be visible on the map
 * @property {Number} [opacity] The opacity that the layers should have, when `undefined` uses the
 *   default opacity for the layer.
 * @property {String} [baseUrl] The base URL of this layer, if applicable (only for external layers)
 * @property {Object} [customAttributes] Other attributes relevant for this layer, such as time
 * @property {String | Number | null | undefined} [customAttributes.year=undefined] Selected year of
 *   the time enabled layer. Can be one of the following values:
 *
 *   - Undefined := either the layer has no timeConfig or we use the default year defined in
 *       layerConfig.timeBehaviour
 *   - 'none' := no year is selected, which means that the layer won't be visible. This happens when
 *       using the TimeSlider where a user can select a year that has no data for this layer.
 *   - 'all' := load all years for this layer (for WMS this means that no TIME param is added and for
 *       WMTS we use the geoadmin definition YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA as timestamp)
 *   - 'current' := load current year, only valid for WMTS layer where 'current' is a valid timestamp.
 *   - YYYY := any valid year entry for this layer, this will load the data only for this year.
 *
 *   This attribute has only effect on timeEnabled layer and External WMS/WMTS layer with timestamp.
 *   Default is `undefined`
 * @property {Number | undefined} [customAttributes.updateDelay=undefined] Automatic refresh time in
 *   millisecondes of the layer. Has only effect on GeoAdminGeoJsonLayer. Default is `undefined`
 * @property {String | undefined} [customAttributes.features=undefined] Colon separated list of
 *   feature IDs to select. Default is `undefined`
 * @property {String | undefined} [customAttributes.adminId=undefined] KML admin ID required to edit
 *   a KML drawing. Default is `undefined`
 * @property {KmlStyles | undefined} [customAttributes.style=undefined] KML style to be applied to
 *   its features, can be one of the value from KmlStyles.enum.js. Default is `undefined`
 */

/**
 * Returns timestamp for WMS or WMTS layer from config data
 *
 * @param {AbstractLayer} layer
 * @returns {String | null | LayerTimeConfig.currentTimeEntry.timestamp}
 */
export function getTimestampFromConfig(layer) {
    let timestamp = layer.timeConfig?.currentTimestamp ?? null
    if (
        timestamp === null &&
        (layer instanceof ExternalWMTSLayer || layer instanceof GeoAdminWMTSLayer)
    ) {
        // for WMTS layer fallback to current
        timestamp = 'current'
    }
    return timestamp
}

/**
 * @param {GeoAdminWMTSLayer | ExternalWMTSLayer} wmtsLayerConfig
 * @param {CoordinateSystem} projection
 * @param {Boolean} [options.addTimestamp=false] Add the timestamp from the time config or the
 *   timeslider to the ur. When false the timestamp is set to `{Time}` and need to processed later
 *   on. Default is `false`
 * @returns {String | null}
 */
export function getWmtsXyzUrl(wmtsLayerConfig, projection, options = {}) {
    const { addTimestamp = false } = options ?? {}
    if (wmtsLayerConfig?.type === LayerTypes.WMTS && projection) {
        let timestamp = '{Time}'
        if (addTimestamp) {
            timestamp = getTimestampFromConfig(wmtsLayerConfig)
        }

        const layerId = wmtsLayerConfig.isExternal
            ? wmtsLayerConfig.id
            : wmtsLayerConfig.technicalName
        return `${getBaseUrlOverride('wmts') ?? wmtsLayerConfig.baseUrl}1.0.0/${layerId}/default/${timestamp}/${projection.epsgNumber}/{z}/{x}/{y}.${wmtsLayerConfig.format}`
    }
    return null
}

/**
 * Returns the index of the max resolution, which is used to determine the maximum zoom level
 * default to the array length
 *
 * @param {CoordinateSystem} projection
 * @param {Number} layerMaxResolution
 * @returns {Number}
 */
export function indexOfMaxResolution(projection, layerMaxResolution) {
    const indexOfResolution = projection.getResolutions().indexOf(layerMaxResolution)
    if (indexOfResolution === -1) {
        return projection.getResolutions().length
    }
    return indexOfResolution
}

/**
 * Creates a LayerFeature object from an OpenLayers feature and a layer.
 *
 * @param {ol.Feature} olFeature - The OpenLayers feature to convert.
 * @param {AbstractLayer} layer - The layer associated with the feature.
 * @returns {LayerFeature | null} The created LayerFeature object or null if the feature has no
 *   geometry.
 */
export function createLayerFeature(olFeature, layer, coordinates, geometry) {
    if (!olFeature?.getGeometry() || geometry) {
        return null
    }
    geometry = geometry ?? new GeoJSON().writeGeometryObject(olFeature.getGeometry())
    return new LayerFeature({
        layer: layer,
        id: olFeature.getId(),
        name:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track feature don't have an ID but have a name !
            olFeature.get('name') ??
            olFeature.getId(),
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        coordinates: coordinates ? coordinates : olFeature.getGeometry().getCoordinates(),
        geometry: geometry,
        extent: normalizeExtent(olFeature.getGeometry().getExtent()),
    })
}
