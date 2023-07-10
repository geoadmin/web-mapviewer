/**
 * Returns timestamp of preview year for WMTS layer from config data
 *
 * @param {Number} previewYear
 * @param {GeoAdminWMTSLayer} wmtsLayerConfig
 * @returns {String | null}
 */
export function getTimestampForPreviewLayer(previewYear, wmtsLayerConfig) {
    if (
        previewYear &&
        wmtsLayerConfig.timeConfig &&
        wmtsLayerConfig.timeConfig.years.includes(previewYear)
    ) {
        return wmtsLayerConfig.timeConfig.getTimeEntryForYear(previewYear).timestamp
    }
    return null
}
