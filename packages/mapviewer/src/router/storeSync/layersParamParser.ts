import type { GeoAdminLayer, Layer, LayerCustomAttributes } from '@geoadmin/layers'
import type { GeoAdminGeoJSONLayer, KMLLayer } from '@geoadmin/layers/dist/types'

import { KmlStyle, LayerType } from '@geoadmin/layers'
import { decodeExternalLayerParam, encodeExternalLayerParam } from '@geoadmin/layers/api'
import { layerUtils, timeConfigUtils } from '@geoadmin/layers/utils'
import { isNumber } from '@geoadmin/numbers'

import type SelectableFeature from '@/api/features/SelectableFeature.class.ts'

import LayerFeature from '@/api/features/LayerFeature.class'
import KmlStyles from '@/api/layers/KmlStyles.enum'

const ENC_COMMA: string = '%2C'
const ENC_SEMI_COLON: string = '%3B'
const ENC_AT: string = '%40'

/**
 * Transform a layer ID in its URL value equivalent
 *
 * @see https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
 */
export function encodeLayerId(layer: Layer): string {
    // special case for internal KMLs, we still want the type identifier before the fileUrl
    // (they won't be available in the layers config, so we treat them as "external" too)
    if (layer.isExternal || layer.type === LayerType.KML) {
        let externalLayerUrlId = ''
        // Group of layers uses type WMS
        if (layer.type === LayerType.GROUP) {
            externalLayerUrlId += LayerType.WMS
        } else {
            externalLayerUrlId += `${layer.type}`
        }
        externalLayerUrlId += `|${encodeExternalLayerParam(layer.baseUrl)}`
        // WMS and WMTS (GROUP are essentially WMS too) need to specify the ID of the layer in the getCap
        if ([LayerType.GROUP, LayerType.WMTS, LayerType.WMS].includes(layer.type)) {
            externalLayerUrlId += `|${encodeExternalLayerParam(layer.id)}`
        }
        return externalLayerUrlId
    }
    return layer.id
}

/**
 * @returns Partial active layer config, derived from what is in the URL layer ID (needs further
 *   parsing to get the opacity, visibility and extra params)
 */
export function decodeUrlLayerId(urlLayerId: string): Partial<Layer> {
    const [rawLayerType, layerBaseUrl, layerId] = urlLayerId.split('|')
    const layerType: LayerType | undefined = layerUtils.transformToLayerTypeEnum(rawLayerType)
    if (layerType) {
        const decodedBaseUrl = decodeExternalLayerParam(layerBaseUrl)
        // KML/GPX do not have layer IDs, so we use their baseUrl as "ID"
        const decodedLayerId = layerId ? decodeExternalLayerParam(layerId) : decodedBaseUrl
        return {
            id: decodedLayerId,
            type: layerType,
            baseUrl: decodedBaseUrl,
        }
    }
    return {
        id: urlLayerId,
    }
}

/**
 * Encode a layer parameter.
 *
 * This percent-encodes the special characters "," ";" and "@" used to separate layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent(). By only encoding the layer parameter separators, we avoid encoding other
 * special characters twice. But we need to encode them twice to avoid layer parsing issue.
 */
export function encodeLayerParam(param: string): string {
    return param.replace(',', ENC_COMMA).replace(';', ENC_SEMI_COLON).replace('@', ENC_AT)
}

/**
 * Decode a layer parameter.
 *
 * This percent-decodes the special characters "," ";" and "@" used to separate layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent(). By only encoding the layer parameter separators, we avoid encoding other
 * special characters twice. But we need to encode them twice to avoid layer parsing issue.
 */
export function decodeLayerParam(param: string): string {
    return param.replace(ENC_COMMA, ',').replace(ENC_SEMI_COLON, ';').replace(ENC_AT, '@')
}

/**
 * Parses the URL param value for `layers` as described in the ADR
 *
 * @param queryValue The value of the `layers` URL param
 * @returns Metadata for layers that must be activated in the app
 * @see https://github.com/geoadmin/web-mapviewer/blob/8fa2cf2ad273779265d2dfad91c8c4b96f47b90f/adr/2021_03_16_url_param_structure.md#L4
 */
export function parseLayersParam(queryValue: string): Partial<Layer>[] {
    const parsedLayer: Partial<Layer>[] = []
    if (queryValue && queryValue.length > 0) {
        queryValue.split(';').forEach((layerQueryString) => {
            const [layerIdWithCustomParams, isVisible, opacity] = layerQueryString.split(',')
            const [layerId, ...otherParams] = layerIdWithCustomParams
                .split('@')
                .map(decodeLayerParam)
            const customAttributes: LayerCustomAttributes = {}
            if (otherParams && otherParams.length > 0) {
                otherParams.forEach((param) => {
                    const [key, value] = param.split('=')
                    let parsedValue: string | boolean | number | undefined
                    if (value === 'true' || value === 'false') {
                        parsedValue = 'true' === value
                    } else if (key === 'features') {
                        // some IDs are "numbers", such as 1314.070, but we NEED the trailing zero
                        // (they shouldn't be parsed as numbers)
                        parsedValue = value
                    } else if (isNumber(value)) {
                        parsedValue = Number(value)
                    } else if (key === 'year' && value.toLowerCase() === 'none') {
                        parsedValue = undefined
                    } else if (
                        key === 'style' &&
                        Object.values(KmlStyles).includes(value?.toUpperCase())
                    ) {
                        parsedValue = value.toUpperCase()
                    } else {
                        parsedValue = value
                    }
                    customAttributes[key] = parsedValue
                })
            }
            parsedLayer.push({
                ...decodeUrlLayerId(layerId),
                isVisible: !isVisible || isVisible === 't',
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
 */
export function transformLayerIntoUrlString(
    layer: Layer,
    defaultLayerConfig: GeoAdminLayer,
    featuresIds?: string[]
): string {
    // NOTE we need to encode "," ";" and "@" characters from the layer to avoid parsing issue.
    let layerUrlString = encodeLayerParam(encodeLayerId(layer))
    if (timeConfigUtils.hasMultipleTimestamps(layer)) {
        // If the layer has more than one timestamp, we need to add the `@year` attribute
        if (layer.timeConfig && layer.timeConfig.currentTimeEntry) {
            // Always add the `@year` if we have a valid currentYear
            layerUrlString += `@year=${timeConfigUtils.getYearFromLayerTimeEntry(layer.timeConfig.currentTimeEntry)}`
        } else if (layer.timeConfig && !layer.timeConfig.currentTimeEntry) {
            // The currentTimeEntry is undefined, which means that a user entered via the timeSlider
            // a non-matching interval for this layer (no available data for the interval selected
            // through the time slider).
            // In this case we set the `@year=none` and the layer won't be visible.
            layerUrlString += `@year=none`
        }
        // In all other cases we don't set the @year attribute and let the application to use the
        // default timestamp. This can happen for External layer using a non ISO timestamp.
    }

    // Add feature IDs attributes
    if (featuresIds) {
        layerUrlString += `@features=${featuresIds.join(':')}`
    }

    // Storing the update delay if different from the default config (or if no default config is present and there's an update delay)
    // this currently only applies to GeoJSON layer
    const layerUpdateDelay: number | undefined =
        'updateDelay' in layer ? (layer as GeoAdminGeoJSONLayer).updateDelay : undefined
    const configUpdateDelay: number | undefined =
        'updateDelay' in defaultLayerConfig
            ? (defaultLayerConfig as GeoAdminGeoJSONLayer).updateDelay
            : undefined
    if (
        layerUpdateDelay &&
        configUpdateDelay &&
        layerUpdateDelay > 0 &&
        configUpdateDelay !== layerUpdateDelay
    ) {
        layerUrlString += `@updateDelay=${layerUpdateDelay}`
    }

    if (layer.type === LayerType.KML) {
        const kmlLayer = layer as KMLLayer
        // for our own files, the default style is GeoAdmin (and we don't want to write that in the URL)
        const defaultKmlStyle = kmlLayer.isExternal ? KmlStyles.DEFAULT : KmlStyles.GEOADMIN
        if (kmlLayer.style !== defaultKmlStyle) {
            layerUrlString += `@style=${kmlLayer.style.toLowerCase()}`
        }
        // only show the "clampToGround" flag when needed, meaning:
        // - when style is geoadmin, and clamp to ground is false
        // - when style is default, and clamp to ground is true
        if (
            (kmlLayer.style === KmlStyle.DEFAULT && kmlLayer.clampToGround) ||
            (kmlLayer.style === KmlStyle.GEOADMIN && !kmlLayer.clampToGround)
        ) {
            layerUrlString += `@clampToGround=${kmlLayer.clampToGround}`
        }
    }

    // Add custom attributes if any
    if (layer.customAttributes) {
        for (const [key, value] of Object.entries(layer.customAttributes)) {
            layerUrlString += `@${key}${value ? '=' + encodeLayerParam(`${value}`) : ''}`
        }
    }

    // Add visibility flag
    if (!layer.isVisible) {
        layerUrlString += `,f`
    }
    if (
        (defaultLayerConfig && layer.opacity !== defaultLayerConfig.opacity) ||
        // for layers that don't have a default config (e.g., external layer): use 1.0 as default opacity
        (!defaultLayerConfig && layer.opacity !== 1.0)
    ) {
        if (layer.isVisible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    return layerUrlString
}

interface FeatureIdsByLayerId {
    [layerId: string]: string[]
}

/**
 * @param selectedFeatures An array of selectable Features
 * @returns A simple object with the layer id as a key for a feature Ids list as value
 */
export function orderFeaturesByLayers(selectedFeatures: SelectableFeature[]): FeatureIdsByLayerId {
    const layersFeatures: FeatureIdsByLayerId = {}

    selectedFeatures
        .filter((feature) => feature instanceof LayerFeature)
        .forEach((feature) => {
            if (!layersFeatures[feature.layer.id]) {
                layersFeatures[feature.layer.id] = []
            }

            layersFeatures[feature.layer.id].push(`${feature.id}`)
        })
    return layersFeatures
}
