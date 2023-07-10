import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'

/**
 * Returns timestamp for WMS layer from config data
 *
 * @param {GeoAdminWMSLayer} wmsLayerConfig
 * @returns {String | string | LayerTimeConfig.currentTimeEntry.timestamp}
 */
export function getWMSTimestampFromConfig(wmsLayerConfig) {
    if (wmsLayerConfig.timeConfig) {
        // if there is a preview year set, we search for the matching timestamp
        if (this.previewYear) {
            const matchingTimeEntry = wmsLayerConfig.getTimeEntryForYear(this.previewYear)
            if (matchingTimeEntry) {
                return matchingTimeEntry.timestamp
            }
        }
        // if a time entry is defined, and is different from 'all'
        // (no need to pass 'all' to our WMS, that's the default timestamp used under the hood)
        if (wmsLayerConfig.timeConfig.currentYear !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
            return wmsLayerConfig.timeConfig.currentTimestamp
        }
    }
    return ''
}
