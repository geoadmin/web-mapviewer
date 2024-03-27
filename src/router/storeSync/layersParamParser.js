import LayerFeature from '@/api/features/LayerFeature.class.js'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import { isNumber } from '@/utils/numberUtils'

const ENC_COMMA = '%2C'
const ENC_SEMI_COLON = '%3B'
const ENC_AT = '%40'

/**
 * Encode an layer parameter.
 *
 * This percent encode the special character , ; and @ used to separate layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding the layer parameter separators we avoid to encode
 * other special character twice. But we need to encode them twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export function encodeLayerParam(param) {
    return param.replace(',', ENC_COMMA).replace(';', ENC_SEMI_COLON).replace('@', ENC_AT)
}

/**
 * Decode an layer parameter.
 *
 * This percent decode the special character , ; and @ used to separate layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding the layer parameter separators we avoid to encode
 * other special character twice. But we need to encode them twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export function decodeLayerParam(param) {
    return param.replace(ENC_COMMA, ',').replace(ENC_SEMI_COLON, ';').replace(ENC_AT, '@')
}

/**
 * Parses the URL param value for `layers` as described in the ADR :
 * `/adr/2021_03_16_url_param_structure.md`
 *
 * @param {String} queryValue The value of the `layers` URL param
 * @returns {ActiveLayerConfig[]} Metadata for layers that must be activated in the app
 */
export function parseLayersParam(queryValue) {
    const parsedLayer = []
    if (queryValue && queryValue.length > 0) {
        queryValue.split(';').forEach((layerQueryString) => {
            const [layerIdWithCustomParams, visible, opacity] = layerQueryString.split(',')
            const [layerId, ...otherParams] = layerIdWithCustomParams
                .split('@')
                .map(decodeLayerParam)
            const customAttributes = {}
            if (otherParams && otherParams.length > 0) {
                otherParams.forEach((param) => {
                    const [key, value] = param.split('=')
                    let parsedValue
                    if (value === 'true' || value === 'false') {
                        parsedValue = 'true' === value
                    } else if (isNumber(value)) {
                        parsedValue = Number(value)
                    } else {
                        parsedValue = value
                    }
                    customAttributes[key] = parsedValue
                })
            }
            parsedLayer.push(
                new ActiveLayerConfig(
                    layerId,
                    !visible || visible === 't',
                    isNumber(opacity) ? Number(opacity) : undefined,
                    customAttributes
                )
            )
        })
    }
    return parsedLayer
}

/**
 * Transform a layer metadata into a string. This value can then be used in the URL to describe a
 * layer and its state (visibility, opacity, etc...)
 *
 * @param {AbstractLayer} layer
 * @param {GeoAdminLayer} [defaultLayerConfig]
 * @param {String[] | null} featuresIds
 * @returns {string}
 */
export function transformLayerIntoUrlString(layer, defaultLayerConfig, featuresIds) {
    // NOTE we need to encode ,;@ characters from the layer to avoid parsing issue.
    let layerUrlString = encodeLayerParam(layer.id)
    if (layer.timeConfig?.timeEntries.length > 1) {
        layerUrlString += `@year=${layer.timeConfig.currentYear}`
    }
    if (featuresIds) {
        layerUrlString += `@features=${featuresIds.join(':')}`
    }
    if (!layer.visible) {
        layerUrlString += `,f`
    }
    if (
        (defaultLayerConfig && layer.opacity !== defaultLayerConfig.opacity) ||
        // for layer that don't have a default config (e.g. external layer) use 1.0 as default opacity
        (!defaultLayerConfig && layer.opacity !== 1.0)
    ) {
        if (layer.visible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    return layerUrlString
}

/**
 * @param {SelectableFeature[]} selectedFeatures An array of selectable Features
 * @returns {Object} A simple object with the layer id as a key for a feature Ids list as value
 */
export function orderFeaturesByLayers(selectedFeatures) {
    const layersFeatures = {}

    selectedFeatures
        .filter((feature) => feature instanceof LayerFeature)
        .forEach((feature) => {
            if (!layersFeatures[feature.layer.id]) {
                layersFeatures[feature.layer.id] = []
            }

            layersFeatures[feature.layer.id].push(feature.id)
        })
    return layersFeatures
}
