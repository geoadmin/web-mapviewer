import LayerFeature from '@/api/features/LayerFeature.class'
import {
    decodeExternalLayerParam,
    encodeExternalLayerParam,
} from '@/api/layers/layers-external.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { isNumber } from '@/utils/numberUtils'

const ENC_COMMA = '%2C'
const ENC_SEMI_COLON = '%3B'
const ENC_AT = '%40'

/**
 * Transform a layer ID in its URL value equivalent
 *
 * @param {AbstractLayer} layer
 * @returns {String}
 * @see https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
 */
export function encodeLayerId(layer) {
    // special case for internal KMLs, we still want the type identifier before the fileUrl
    // (they won't be available in the layers config, so we treat them as "external" too)
    if (layer.isExternal || layer.type === LayerTypes.KML) {
        let externalLayerUrlId = ''
        // Group of layers uses type WMS
        if (layer.type === LayerTypes.GROUP) {
            externalLayerUrlId += LayerTypes.WMS
        } else {
            externalLayerUrlId += `${layer.type}`
        }
        externalLayerUrlId += `|${encodeExternalLayerParam(layer.baseUrl)}`
        // WMS and WMTS (GROUP are essentially WMS too) need to specify the ID of the layer in the getCap
        if ([LayerTypes.GROUP, LayerTypes.WMS, LayerTypes.WMTS].includes(layer.type)) {
            externalLayerUrlId += `|${encodeExternalLayerParam(layer.id)}`
        }
        return externalLayerUrlId
    }
    return layer.id
}

/**
 * @param {String} urlLayerId
 * @returns {ActiveLayerConfig} Partial active layer config, derived from what is in the URL layer
 *   ID (needs further parsing to get the opacity, visibility and extra params)
 */
export function decodeUrlLayerId(urlLayerId) {
    const [layerType, layerBaseUrl, layerId] = urlLayerId.split('|')
    if (Object.values(LayerTypes).includes(layerType)) {
        const decodedBaseUrl = decodeExternalLayerParam(layerBaseUrl)
        // KML/GPX do not have layer IDs, so we use their baseUrl as "ID"
        const decodedLayerId = layerId ? decodeExternalLayerParam(layerId) : decodedBaseUrl
        return {
            isExternal: true,
            id: decodedLayerId,
            type: layerType,
            baseUrl: decodedBaseUrl,
        }
    }
    return {
        isExternal: false,
        id: urlLayerId,
    }
}

/**
 * Encode a layer parameter.
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
                    } else if (key === 'year' && value.toLowerCase() === 'none') {
                        parsedValue = null
                    } else {
                        parsedValue = value
                    }
                    customAttributes[key] = parsedValue
                })
            }
            parsedLayer.push({
                ...decodeUrlLayerId(layerId),
                visible: !visible || visible === 't',
                opacity: isNumber(opacity) ? Number(opacity) : undefined,
                customAttributes,
            })
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
 * @returns {String}
 */
export function transformLayerIntoUrlString(layer, defaultLayerConfig, featuresIds) {
    // NOTE we need to encode ,;@ characters from the layer to avoid parsing issue.
    let layerUrlString = encodeLayerParam(encodeLayerId(layer))
    if (layer.hasMultipleTimestamps) {
        // If the layer has more than 1 timestamps we need to add the `@year` attribute
        if (layer.timeConfig.currentYear !== null) {
            // Always add the `@year` if we have a valid currentYear
            layerUrlString += `@year=${layer.timeConfig.currentYear}`
        } else if (layer.timeConfig.currentTimeEntry === null) {
            // The currentTimeEntry is null, this means that a user entered via the timeSlider
            // a non matching year for this layer (year set by timeSlider don't match any available
            // timestamps for this layer). In this case we set the `@year=none` and the layer won't
            // be visible.
            layerUrlString += `@year=none`
        }
        // In all other cases we don't set the @year attribute and let the application to use the
        // default timestamp. This can happen for External layer using a non ISO timestamp.
    }

    // Add features ID attributes
    if (featuresIds) {
        layerUrlString += `@features=${featuresIds.join(':')}`
    }

    // Storing the update delay if different from the default config (or if no default config is present and there's an update delay)
    // this currently only applies to GeoJSON layer
    if (
        layer.updateDelay > 0 &&
        (!defaultLayerConfig || defaultLayerConfig.updateDelay !== layer.updateDelay)
    ) {
        layerUrlString += `@updateDelay=${layer.updateDelay}`
    }

    // Add custom attributes if any
    if (layer.customAttributes !== null) {
        for (const [key, value] of Object.entries(layer.customAttributes)) {
            layerUrlString += `@${key}${value ? '=' + encodeLayerParam(value) : ''}`
        }
    }

    // Add visibility flag
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
