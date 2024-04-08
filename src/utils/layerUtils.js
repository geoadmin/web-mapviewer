import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

export class ActiveLayerConfig {
    /**
     * @param {String} id The layer id
     * @param {Boolean} visible Flag telling if the layer should be visible on the map
     * @param {Number | undefined} opacity The opacity that the layers should have, when `undefined`
     *   uses the default opacity for the layer.
     * @param {Object} customAttributes Other attributes relevant for this layer, such as time
     */
    constructor(id, visible, opacity = undefined, customAttributes = {}) {
        this.id = id
        this.visible = visible
        this.opacity = opacity
        this.customAttributes = customAttributes
    }
}

/**
 * Returns timestamp for WMS or WMTS layer from config data
 *
 * @param {GeoAdminWMSLayer | GeoAdminWMTSLayer} config
 * @param {Number} previewYear
 * @returns {String | string | LayerTimeConfig.currentTimeEntry.timestamp}
 */
export function getTimestampFromConfig(config, previewYear) {
    if (config.timeConfig) {
        // if there is a preview year set, we search for the matching timestamp
        if (previewYear) {
            if (config.timeConfig.years.includes(previewYear)) {
                const matchingTimeEntry = config.timeConfig.getTimeEntryForYear(previewYear)
                if (matchingTimeEntry) {
                    return matchingTimeEntry.timestamp
                }
            }
        }
        // when the time slider is not active,
        // if a time entry is defined, and is different from 'all'
        // (no need to pass 'all' to our WMS, that's the default timestamp used under the hood)
        else if (config.timeConfig.currentYear !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
            return config.timeConfig.currentTimestamp
        }
    }
    return config instanceof GeoAdminWMTSLayer ? null : ''
}

/**
 * @param {GeoAdminWMTSLayer | ExternalWMTSLayer} wmtsLayerConfig
 * @param {CoordinateSystem} projection
 * @param {Number} previewYear
 * @returns {String | null}
 */
export function getWmtsXyzUrl(wmtsLayerConfig, projection, previewYear) {
    if (wmtsLayerConfig?.type === LayerTypes.WMTS && projection) {
        const timestamp = getTimestampFromConfig(wmtsLayerConfig, previewYear) ?? 'current'

        const layerId = wmtsLayerConfig.isExternal
            ? wmtsLayerConfig.externalLayerId
            : wmtsLayerConfig.technicalName
        return `${wmtsLayerConfig.baseUrl}1.0.0/${layerId}/default/${timestamp}/${projection.epsgNumber}/{z}/{x}/{y}.${wmtsLayerConfig.format}`
    }
    return null
}
