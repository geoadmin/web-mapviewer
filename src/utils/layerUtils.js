import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'

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
        if (previewYear && config.timeConfig.years.includes(previewYear)) {
            const matchingTimeEntry = config.timeConfig.getTimeEntryForYear(previewYear)
            if (matchingTimeEntry) {
                return matchingTimeEntry.timestamp
            }
        }
        // if a time entry is defined, and is different from 'all'
        // (no need to pass 'all' to our WMS, that's the default timestamp used under the hood)
        if (config.timeConfig.currentYear !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
            return config.timeConfig.currentTimestamp
        }
    }
    return config instanceof GeoAdminWMTSLayer ? null : ''
}
