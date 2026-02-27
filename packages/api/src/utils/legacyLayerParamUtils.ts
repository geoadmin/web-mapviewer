import type { GeoAdminLayer, KMLLayer, Layer } from '@swissgeo/layers'
import type { Staging } from '@swissgeo/staging-config'

import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'

import filesAPI from '@/files'

const legacyOnlyURLParams = [
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
function readUrlParamValue(url: string, paramName: string): string | undefined {
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
const isLegacyParams = (search: string | undefined): boolean => {
    return !!search?.match(/^(\?|\/\?).+$/g)
}

/**
 * Ensure opacity is within its bounds (0 and 1). Also assign a default value of 1 should the
 * parameter be something unexpected
 *
 * @param value
 * @returns A float between 0 and 1
 */
function parseOpacity(value: string): number {
    try {
        if (isNaN(Number(value))) {
            throw new Error()
        }
        return Math.max(Math.min(Number(value), 1), 0)
    } catch (error) {
        log.error({
            title: 'legacyLayerParamUtils / parseOpacity',
            messages: [`failed to parse opacity value : ${value}, default to 1`, error],
        })
        return 1
    }
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
 * @returns
 */
function getLayersFromLegacyUrlParams(
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
            layer = { ...layer }
        }
        if (layerId.startsWith('KML||')) {
            const [_layerType, url] = layerId.split('||')
            layer = layerUtils.makeKMLLayer({
                kmlFileUrl: url,
                isVisible: true,
                style: 'GEOADMIN',
            })
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
                const customAttributes: Record<string, string> = {}
                try {
                    const parsedUrl = new URL(url)
                    for (const [key, value] of parsedUrl.searchParams) {
                        // ignore well known params to avoid conflict with the service
                        if (!['SERVICE', 'REQUEST', 'VERSION'].includes(key.toUpperCase())) {
                            customAttributes[key] = value
                        }
                    }
                } catch (error) {
                    log.error({
                        title: 'legacyLayerParamUtils / getLayersFromLegacyUrlParams',
                        messages: [`Invalid URL ${url}`, error],
                    })
                }
                layer = layerUtils.makeExternalWMSLayer({
                    id,
                    name: name ? name : id,
                    baseUrl: url,
                    wmsVersion: version,
                    customAttributes,
                    wmsOperations: {
                        GetCapabilities: {
                            DCPType: [{ HTTP: { Get: { OnlineResource: url } } }],
                            Format: ['text/xml'],
                        },
                        GetMap: {
                            DCPType: [{ HTTP: { Get: { OnlineResource: url } } }],
                            Format: ['image/png', 'image/jpeg'],
                        },
                    },
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
                layer.opacity = layerOpacities[index] ?? 0
            }
            // checking if a timestamp is defined for this layer
            if (layerTimestamps.length > index && layerTimestamps[index] !== '') {
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
 * @param layersConfig
 * @param legacyUrlParams
 * @returns The background layer defined in the URL (`null` for void layer, `undefined` if nothing
 *   is set in the URL)
 */
function getBackgroundLayerFromLegacyUrlParams(
    layersConfig: GeoAdminLayer[],
    legacyUrlParams: string
): string | null | undefined {
    if (Array.isArray(layersConfig)) {
        const bgLayerId = readUrlParamValue(legacyUrlParams, 'bgLayer')
        if (bgLayerId === 'voidLayer') {
            return null
        }
        return bgLayerId
    }
    return undefined
}

/**
 * Returns a KML Layer from the legacy adminId url param.
 *
 * @param adminId KML admin ID
 * @returns KML Layer
 */
async function getKmlLayerFromLegacyAdminIdParam(
    adminId: string,
    staging: Staging = 'production'
): Promise<KMLLayer> {
    const kmlMetadata = await filesAPI.getKmlMetadataByAdminId(adminId, staging)
    return layerUtils.makeKMLLayer({
        kmlFileUrl: kmlMetadata.links.kml,
        isVisible: true,
        adminId: kmlMetadata.adminId,
        kmlMetadata,
    })
}

/**
 * @param layerId The layer Id for which we have features
 * @param featuresIds The features ids we need to add as a parameter. This a coma-separated string
 * @param layers The new Query layers parameter, a semicolon separated string
 * @returns
 */
function createLayersParamForFeaturePreselection(
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
    const layersArray = layers.split(';')

    // we find the Layer which is already present
    const layer = layersArray.find((l) => l.match(new RegExp(`^${layerId}([@,].*)?$`)))

    if (!layer) {
        return layers
    }

    const [layerIdWithCustomParams = '', visible, opacity] = layer.split(',')

    let layerString = layerIdWithCustomParams
    const featuresParam = layerIdWithCustomParams
        .split('@')
        .filter((extraParam) => extraParam.includes('features='))
    if (featuresParam.length > 0 && featuresParam[0]) {
        const layerAndParams = layerIdWithCustomParams.split('@')
        // in case there are extra parameters other than 'features', we ensure they are kept
        layerString = layerAndParams.filter((param) => !param.includes('features=')).join('@')

        const featuresParts = featuresParam[0].split('=')
        const featuresIds = (featuresParts[1] ?? '').split(':')
        featuresIds.forEach((featureId) => {
            if (!featuresArray.includes(featureId)) {
                featuresArray.push(featureId)
            }
        })
    }
    layerString += `@features=${featuresArray.join(':')}`
    if (visible || opacity) {
        // we add back the visibility and the opacity
        layerString = `${layerString},${visible},${opacity}`
    }
    // we replace the original layer by the updated layer
    layersArray[layersArray.indexOf(layer)] = layerString
    return layersArray.join(';')
}

export const legacyLayerParamUtils = {
    legacyOnlyURLParams,
    isLegacyParams,
    parseOpacity,
    getLayersFromLegacyUrlParams,
    getBackgroundLayerFromLegacyUrlParams,
    getKmlLayerFromLegacyAdminIdParam,
    createLayersParamForFeaturePreselection,
}

export default legacyLayerParamUtils
