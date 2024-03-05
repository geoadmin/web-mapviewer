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
 * @returns {string}
 */
export function transformLayerIntoUrlString(layer, defaultLayerConfig) {
    // NOTE we need to encode ,;@ characters from the layer to avoid parsing issue.
    let layerUrlString = encodeLayerParam(layer.id)
    if (layer.timeConfig?.timeEntries.length > 1) {
        layerUrlString += `@year=${layer.timeConfig.currentYear}`
    }
    if (!layer.visible) {
        layerUrlString += `,f`
    }
    // if no default layers config (e.g. external layers) or if the opacity is not the same as the default one
    if (!defaultLayerConfig || layer.opacity !== defaultLayerConfig.opacity) {
        if (layer.visible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    return layerUrlString
}
