/**
 * We currently have a problem with the KML serialization where we loose the anchor values. This
 * seems to be a problem with the treatment by OpenLayers of the hotSpot KML tag. The helper
 * functions provided by this module are hacks intended to be used until we can push a fix to
 * {ol.format.KML} upstream.
 *
 * @module utils/featureAnchor
 * @see {@link https://jira.swisstopo.ch/browse/BGDIINF_SB-2109}
 * @see {@link https://jira.swisstopo.ch/browse/BGDIINF_SB-2165}
 * @see {@link https://github.com/openlayers/openlayers/blob/v6.10.0/src/ol/format/KML.js#L2624-L2654}
 * @see {@link ol.format.KML}
 */

/**
 * Serializes the feature's anchor and stores it in a separate property.
 *
 * @param {ol.Feature} feature The feature to serialize.
 * @returns {void}
 */
export function serializeAnchor(feature) {
    feature.set('anchorString', JSON.stringify(feature.get('anchor')))
}

/**
 * Deserializes the anchor from the separate property and updates the original property.
 *
 * @param {ol.Feature} feature The feature to serialize.
 * @returns {void}
 */
export function deserializeAnchor(feature) {
    const anchorString = feature.get('anchorString')
    if (/\[\d+(\.\d+)?,\d+(\.\d+)?\]/.test(anchorString)) {
        feature.set('anchor', JSON.parse(feature.get('anchorString')))
    }
}
