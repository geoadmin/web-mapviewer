import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

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
 */

/**
 * Returns timestamp for WMS or WMTS layer from config data
 *
 * @param {GeoAdminWMSLayer | GeoAdminWMTSLayer} config
 * @param {Number} previewYear
 * @param {Boolean} isTimeSliderActive
 * @returns {String | string | LayerTimeConfig.currentTimeEntry.timestamp}
 */
export function getTimestampFromConfig(config, previewYear, isTimeSliderActive) {
    if (config.timeConfig) {
        // if there is a preview year set, we search for the matching timestamp
        if (isTimeSliderActive) {
            if (config.timeConfig.getTimeEntryForYear(previewYear)) {
                return config.timeConfig.getTimeEntryForYear(previewYear).timestamp
            }
        }
        // when the time slider is not active,
        // if a time entry is defined, and is different from 'all'
        // (no need to pass 'all' to our WMS, that's the default timestamp used under the hood)
        else {
            return config.timeConfig.currentTimestamp
        }
    }
    return config instanceof GeoAdminWMTSLayer ? null : ''
}

/**
 * @param {GeoAdminWMTSLayer | ExternalWMTSLayer} wmtsLayerConfig
 * @param {CoordinateSystem} projection
 * @param {Number} previewYear
 * @param {Boolean} isTimeSliderActive
 * @returns {String | null}
 */
export function getWmtsXyzUrl(wmtsLayerConfig, projection, previewYear, isTimeSliderActive) {
    if (wmtsLayerConfig?.type === LayerTypes.WMTS && projection) {
        const timestamp =
            getTimestampFromConfig(wmtsLayerConfig, previewYear, isTimeSliderActive) ?? 'current'

        const layerId = wmtsLayerConfig.isExternal
            ? wmtsLayerConfig.id
            : wmtsLayerConfig.technicalName
        return `${wmtsLayerConfig.baseUrl}1.0.0/${layerId}/default/${timestamp}/${projection.epsgNumber}/{z}/{x}/{y}.${wmtsLayerConfig.format}`
    }
    return null
}
