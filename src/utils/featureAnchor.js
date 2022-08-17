/**
 * Openlayers saves extended data as simple key value pairs. As such, it cannot save whole objects,
 * so this parser is used to serialize and deserialize the extended data.
 *
 * @module utils/featureAnchor
 * @see {@link ol.format.KML}
 */

import { Icon } from '@/api/icon.api'

/**
 * Serializes the extended data.
 *
 * @param {ol.Feature} feature The feature to serialize.
 */
export function serializeAnchor(feature) {
    feature.set('anchorString', JSON.stringify(feature.get('anchor')))
}

/**
 * Deserializes the extended data.
 *
 * @param {ol.Feature} feature The feature to deserialize.
 */
export function deserializeAnchor(feature) {
    const anchorString = feature.get('anchorString')
    if (/\[\d+(\.\d+)?,\d+(\.\d+)?\]/.test(anchorString)) {
        feature.set('anchor', JSON.parse(feature.get('anchorString')))
    }
    const iconString = feature.get('icon')
    if (iconString) {
        feature.set(
            'icon',
            Object.create(Icon.prototype, Object.getOwnPropertyDescriptors(JSON.parse(iconString)))
        )
    }
}
