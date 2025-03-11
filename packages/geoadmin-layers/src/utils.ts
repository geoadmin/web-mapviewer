import type { GeoAdminAPILayer, Layer } from "@/layers"

/**
 * Returns which topic should be used in URL that needs one topic to be defined (identify or
 * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If
 * `ech` is not present in the topics, the first of them should be used to request the backend.
 *
 * @returns {String} The topic to use in request to the backend for this layer
 */
export function getTopicForIdentifyAndTooltipRequests(layer: GeoAdminAPILayer) {
    // by default, the frontend should always request `ech`, so if there's no topic that's what we do
    // if there are some topics, we look if `ech` is one of them, if so we return it
    if (layer.topics.length === 0 || layer.topics.indexOf('ech') !== -1) {
        return 'ech'
    }
    // otherwise we return the first topic to make our backend requests for identify and htmlPopup
    return layer.topics[0]
}


export const hasMultipleTimestamps = (layer: Layer): boolean => {
    return (layer.timeConfig?.timeEntries?.length || 0) > 1
}
