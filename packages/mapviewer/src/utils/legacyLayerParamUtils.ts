import type { GeoAdminLayer, Layer, LayerCustomAttributes, KMLLayer } from '@geoadmin/layers'
import type { LocationQueryRaw } from 'vue-router'

import { KMLStyle } from '@geoadmin/layers'
import { timeConfigUtils, layerUtils } from '@geoadmin/layers/utils'
import log from '@geoadmin/log'
import { cloneDeep, isString } from 'lodash'

import { getKmlMetadataByAdminId } from '@/api/files.api'
import storeSyncConfig from '@/router/storeSync/storeSync.config'
import useLayersStore from '@/store/modules/layers.store.ts'
import { makeKmlLayer } from '@/utils/kmlUtils'

const standardURLParams: string[] = storeSyncConfig.map((param) => {
    return param.urlParamName
})
const legacyOnlyURLParams: string[] = [
    'E',
    'X',
    'N',
    'Y',
    'lat',
    'lon',
    'zoom',
    'layers_visibility',
    'layers_opacity',
    'layers_timestamp',
    'swipe_ratio',
    'elevation',
    'pitch',
    'heading',
    'showTooltip',
]
function readUrlParamValue(url?: string, paramName?: string): string | undefined {
    if (url && paramName && url.indexOf(paramName) !== -1) {
        const urlStartingAtParamDeclaration = url.substring(url.indexOf(paramName) + 1)
        const indexOfNextParamSeparator = urlStartingAtParamDeclaration.indexOf('&')
        return urlStartingAtParamDeclaration.substring(
            paramName.length,
            indexOfNextParamSeparator !== -1 ? indexOfNextParamSeparator : undefined
        )
    }
    return undefined
}

/**
 * @param search The query made to the mapviewer
 * @returns True if the query starts with ? or /?
 */
export function isLegacyParams(search: string): boolean {
    return !!search?.match(/^(\?|\/\?).+$/g)
}

/**
 * Ensure opacity is within its bounds (0 and 1). Also assign a default value of 1 should the
 * parameter be something unexpected
 *
 * @param value
 * @returns A float between 0 and 1
 */
export function parseOpacity(value: string): number {
    try {
        if (!isNaN(Number(value))) {
            return Math.max(Math.min(Number(value), 1), 0)
        }
    } catch (error) {
        log.error(`failed to parse opacity value : ${value}, default to 1`, error)
    }
    return 1
}

/**
 * Reads URL params :
 *
 * - Layers
 * - Layers_opacity
 * - Layers_visibility
 * - Layers_timestamp
 *
 * And returns a list of (copies of) layers that should be activated with the correct configuration
 * already set (visibility, opacity, etc...). Bear in mind that these layers are not yet dispatched
 * to the store (they are deep copy of what was given as layersConfig param, with opacity/visibility
 * set according to the legacyLayersParam)
 *
 * @param layersConfig
 * @param layers A string containing all layers ids
 * @param legacyVisibilities A string containing the visibility value for each layer
 * @param legacyOpacities A string containing the opacity value for each layer
 * @param legacyTimestamp A string containing the timestamp or year for each time enabled layer
 */
export function getLayersFromLegacyUrlParams(
    layersConfig: GeoAdminLayer[],
    layers?: string,
    legacyVisibilities?: string,
    legacyOpacities?: string,
    legacyTimestamp?: string
): Layer[] {
    const layersToBeActivated: Layer[] = []
    // In the case these parameters are not defined, we ensure we have empty arrays rather than
    // 'undefined' elements. Since the function is also called in `topics.api.js`, it can be called
    // with a completely empty string.
    const layersIds = layers?.split(/,(?![^|]* )/g).map(decodeURIComponent) ?? []
    const layerOpacities = legacyOpacities?.split(',').map(parseOpacity) ?? []
    const layerVisibilities = legacyVisibilities?.split(',') ?? []
    const layerTimestamps = legacyTimestamp?.split(',') ?? []
    layersIds.forEach((layerId, index) => {
        let layer: Layer | undefined = layersConfig.find((layer) => layer.id === layerId)
        // if this layer can be found in the list of GeoAdminLayers (from the config), we use that as the basis
        // to add it to the map
        if (layer) {
            // we can't modify "layer" straight because it comes from the Vuex state, so we deep copy it
            // in order to alter it before returning it
            layer = cloneDeep(layer)
        }
        if (layerId.startsWith('KML||')) {
            const [_layerType, url] = layerId.split('||')
            layer = makeKmlLayer({ kmlFileUrl: url, isVisible: true, style: KMLStyle.GEOADMIN })
        }
        if (layerId.startsWith('GPX||')) {
            const [_layerType, url] = layerId.split('||')
            layer = layerUtils.makeGPXLayer({ gpxFileUrl: url, isVisible: true })
        }
        if (layerId.startsWith('WMTS||')) {
            const [_layerType, id, url] = layerId.split('||')
            if (layerId && url) {
                layer = layerUtils.makeExternalWMTSLayer({ name: id, baseUrl: url, id })
            }
        }
        if (layerId.startsWith('WMS||')) {
            const [_layerType, name, url, id, version] = layerId.split('||')
            // we only decode if we have enough material
            if (url && id) {
                const customAttributes: LayerCustomAttributes = {}
                try {
                    const parsedUrl = new URL(url)
                    for (const [key, value] of parsedUrl.searchParams) {
                        // ignore well known params to avoid conflict with the service
                        if (!['SERVICE', 'REQUEST', 'VERSION'].includes(key.toUpperCase())) {
                            customAttributes[key] = value
                        }
                    }
                } catch (error) {
                    log.error(`Invalid URL ${url}`, error)
                }
                layer = layerUtils.makeExternalWMSLayer({
                    id,
                    name: name ? name : id,
                    baseUrl: url,
                    wmsVersion: version,
                    customAttributes,
                })
            }
        }
        if (layer) {
            // checking if visibility is set in URL
            if (layerVisibilities.length > index) {
                layer.isVisible = layerVisibilities[index] === 'true'
            } else {
                // if param layers_visibility is not present, it means all layers are visible
                layer.isVisible = true
            }
            // checking if opacity is set in the URL
            if (layerOpacities.length > index) {
                layer.opacity = layerOpacities[index]
            }
            // checking if a timestamp is defined for this layer
            if (
                layer.timeConfig &&
                layerTimestamps.length > index &&
                layerTimestamps[index] !== ''
            ) {
                timeConfigUtils.updateCurrentTimeEntry(layer.timeConfig, layerTimestamps[index])
            }
            layersToBeActivated.push(layer)
        }
    })
    return layersToBeActivated
}

/**
 * Reads the URL param "bgLayer" and return the (copy) of the layer that should be the background
 *
 * If there is no background set (void layer), `null` is returned
 *
 * If no "bgLayer" param is present in the URL, `undefined` is returned
 *
 * @returns The background layer defined in the URL (`null` for void layer, `undefined` if nothing
 *   is set in the URL)
 */
export function getBackgroundLayerFromLegacyUrlParams(
    layersConfig: GeoAdminLayer[],
    legacyUrlParams: string
): GeoAdminLayer | null | undefined {
    if (Array.isArray(layersConfig) && isString(legacyUrlParams)) {
        const bgLayerId = readUrlParamValue(legacyUrlParams, 'bgLayer')
        if (bgLayerId === 'voidLayer' || bgLayerId === 'void' || !bgLayerId) {
            return null
        }
        return layersConfig.find((layer) => layer.id === bgLayerId)
    }
    return undefined
}

/** Returns a KML Layer from the legacy adminId url param. */
export async function getKmlLayerFromLegacyAdminIdParam(adminId: string): Promise<KMLLayer> {
    const kmlMetadata = await getKmlMetadataByAdminId(adminId)
    return makeKmlLayer({
        kmlFileUrl: kmlMetadata.links.kml,
        isVisible: true,
        adminId: kmlMetadata.adminId,
        kmlMetadata,
    })
}

/**
 * Parse all params to check if a layer-id=features-ids parameter has been sent. If this is the
 * case, we either add the layers parameter if it doesn't exist, add the layer to the existing
 * layers param if it exists and the layer is not part of it, or we need to insert the features to
 * the existing layer
 *
 * @param params The parameters sent to the legacy router
 * @param newQuery
 */
export function handleLegacyFeaturePreSelectionParam(
    params: URLSearchParams,
    newQuery: LocationQueryRaw
): void {
    const layersStore = useLayersStore()

    // we begin by removing all params that are either a standard URL param, or a
    // legacy specific param
    const relevantParams: [string, string][] = Object.entries(Object.fromEntries(params)).filter(
        ([key]) => !(standardURLParams.includes(key) || legacyOnlyURLParams.includes(key))
    )
    relevantParams
        .filter(([key]) => layersStore.config.some((layer) => layer.id === key))
        .forEach(([layerId, featuresIds]) => {
            // we only iterate on layers
            if (newQuery.layers?.match(new RegExp(`\\b${layerId}\\b`))) {
                // the layer given as key is also in the query 'layers'
                // we need to ensure all params are kept intact
                newQuery.layers = createLayersParamForFeaturePreselection(
                    layerId,
                    featuresIds,
                    newQuery.layers
                )
            } else {
                // the layer is not yet part of the `layers` parameter
                if (!newQuery.layers) {
                    // if there are no layers parameters at all, we need to create one
                    newQuery.layers = ''
                }
                if (newQuery.layers.length > 0) {
                    newQuery.layers += ';'
                }
                newQuery.layers += `${layerId}@features=${featuresIds.split(',').join(':')}`
            }
        })
}

/**
 * @param layerId The layer ID for which we have features
 * @param featuresIds The features ids we need to add as a parameter. This a coma-separated string
 * @param layers The new Query layers parameter, a semicolon-separated string
 */
export function createLayersParamForFeaturePreselection(
    layerId: string,
    featuresIds: string,
    layers: string
): string {
    // if the features Ids are null, we replace them with an empty array
    // we also remove all empty strings from the featuresIds
    const featuresArray = (featuresIds ? featuresIds.split(',') : []).filter(
        (featureId) => featureId !== ''
    )
    // if there are no features to add, we simply return the layers
    if (featuresArray.length === 0) {
        return layers
    }
    const layersArray: string[] = layers.split(';')

    // we find the Layer which is already present
    const layer: string | undefined = layersArray.find((l) =>
        l.match(new RegExp(`^${layerId}([@,].*)?$`))
    )
    if (!layer) {
        return layers
    }

    const [layerIdWithCustomParams, isVisible, opacity] = layer.split(',')

    let layerString = layerIdWithCustomParams
    const featuresParam = layerIdWithCustomParams
        .split('@')
        .filter((extraParam) => extraParam.includes('features='))
    if (featuresParam.length > 0) {
        const layerAndParams = layerIdWithCustomParams.split('@')
        // in case there are extra parameters other than 'features', we ensure they are kept
        layerString = layerAndParams.filter((param) => !param.includes('features=')).join('@')

        const featuresIds = featuresParam[0].split('=')[1].split(':')
        featuresIds.forEach((featureId) => {
            if (!featuresArray.includes(featureId)) {
                featuresArray.push(featureId)
            }
        })
    }
    layerString += `@features=${featuresArray.join(':')}`
    if (isVisible || opacity) {
        // we add back the visibility and the opacity
        layerString = `${layerString},${isVisible},${opacity}`
    }
    // we replace the original layer by the updated layer
    layersArray[layersArray.indexOf(layer)] = layerString
    return layersArray.join(';')
}
