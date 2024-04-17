import { getKmlMetadataByAdminId } from '@/api/files.api'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import storeSyncConfig from '@/router/storeSync/storeSync.config'
import log from '@/utils/logging'

const standardURLParams = storeSyncConfig.map((param) => {
    return param.urlParamName
})
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
function readUrlParamValue(url, paramName) {
    if (url && paramName && url.indexOf(paramName) !== -1) {
        const urlStartingAtParamDeclaration = url.substr(url.indexOf(paramName) + 1)
        const indexOfNextParamSeparator = urlStartingAtParamDeclaration.indexOf('&')
        return urlStartingAtParamDeclaration.substring(
            paramName.length,
            indexOfNextParamSeparator !== -1 ? indexOfNextParamSeparator : undefined
        )
    }
    return undefined
}

/**
 * @param {String} search The query made to the mapviewer
 * @returns {Boolean} True if the query starts with ? or /?
 */
export const isLegacyParams = (search) => {
    return !!search?.match(/^(\?|\/\?).+$/g) ?? false
}

/**
 * Ensure opacity is within its bounds (0 and 1). Also assign a default value of 1 should the
 * parameter be something unexpected
 *
 * @param {String} value
 * @returns {Number} A float between 0 and 1
 */
export function parseOpacity(value) {
    try {
        if (isNaN(Number(value))) {
            throw new Error()
        }
        return Math.max(Math.min(Number(value), 1), 0)
    } catch (error) {
        log.error(`failed to parse opacity value : ${value}, default to 1`)
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
 * @param {GeoAdminLayer[]} layersConfig
 * @param {String} layers A string containing all layers ids
 * @param {String} legacyVisibilities A string containing the visibility value for each layer
 * @param {String} legacyOpacities A string containing the opacity value for each layer
 * @param {String} legacyTimestamp A string containing the timestamp or year for each time enabled
 *   layer
 * @returns {AbstractLayer[]}
 */
export function getLayersFromLegacyUrlParams(
    layersConfig,
    layers,
    legacyVisibilities,
    legacyOpacities,
    legacyTimestamp
) {
    const layersToBeActivated = []
    // In the case these parameters are not defined, we ensure we have empty arrays rather than
    // 'undefined' elements. Since the function is also called in `topics.api.js`, it can be called
    // with a completely empty string.
    const layersIds = layers?.split(/,(?![^|]* )/g).map(decodeURIComponent) ?? []
    const layerOpacities = legacyOpacities?.split(',').map(parseOpacity) ?? []
    const layerVisibilities = legacyVisibilities?.split(',') ?? []
    const layerTimestamps = legacyTimestamp?.split(',') ?? []
    layersIds.forEach((layerId, index) => {
        let layer = layersConfig.find((layer) => layer.id === layerId)
        // if this layer can be found in the list of GeoAdminLayers (from the config), we use that as the basis
        // to add it to the map
        if (layer) {
            // we can't modify "layer" straight because it comes from the Vuex state, so we deep copy it
            // in order to alter it before returning it
            layer = layer.clone()
        }
        if (layerId.startsWith('KML||')) {
            const [_layerType, url] = layerId.split('||')
            layer = new KMLLayer({ kmlFileUrl: url, visible: true })
        }
        if (layerId.startsWith('WMTS||')) {
            const [_layerType, id, url] = layerId.split('||')
            if (layerId && url) {
                layer = new ExternalWMTSLayer({ name: id, baseUrl: url, id })
            }
        }
        if (layerId.startsWith('WMS||')) {
            const [_layerType, name, url, id, version] = layerId.split('||')
            // we only decode if we have enough material
            if (url && id) {
                layer = new ExternalWMSLayer({
                    id,
                    name: name ? name : id,
                    baseUrl: url,
                    wmsVersion: version,
                })
            }
        }
        if (layer) {
            // checking if visibility is set in URL
            if (layerVisibilities.length > index) {
                layer.visible = layerVisibilities[index] === 'true'
            } else {
                // if param layers_visibility is not present, it means all layers are visible
                layer.visible = true
            }
            // checking if opacity is set in the URL
            if (layerOpacities.length > index) {
                layer.opacity = layerOpacities[index]
            }
            // checking if a timestamp is defined for this layer
            if (layerTimestamps.length > index && layerTimestamps[index]) {
                layer.timeConfig.updateCurrentTimeEntry(layerTimestamps[index])
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
 * @param {GeoAdminLayer[]} layersConfig
 * @param {String} legacyUrlParams
 * @returns {null | undefined | GeoAdminLayer} The background layer defined in the URL (`null` for
 *   void layer, `undefined` if nothing is set in the URL)
 */
export function getBackgroundLayerFromLegacyUrlParams(layersConfig, legacyUrlParams) {
    if (Array.isArray(layersConfig) && typeof legacyUrlParams === 'string') {
        const bgLayerId = readUrlParamValue(legacyUrlParams, 'bgLayer')
        if (bgLayerId === 'voidLayer') {
            return null
        }
        if (bgLayerId) {
            return layersConfig.find((layer) => layer.id === bgLayerId)
        }
    }
    return undefined
}

/**
 * Returns a KML Layer from the legacy adminId url param.
 *
 * @param {String} adminId KML admin ID
 * @returns {Promise<KMLLayer>} KML Layer
 */
export async function getKmlLayerFromLegacyAdminIdParam(adminId) {
    const kmlMetadata = await getKmlMetadataByAdminId(adminId)
    return new KMLLayer({
        kmlFileUrl: kmlMetadata.links.kml,
        visible: true,
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
 * @param {URLSearchParams} params The parameters sent to the legacy router
 * @param {Store} store
 * @param {Query} newQuery
 */
export function handleLegacyFeaturePreSelectionParam(params, store, newQuery) {
    // we begin by removing all params that are either a standard URL param, or a
    // legacy specific param
    const relevantParams = Object.entries(Object.fromEntries(params)).filter(
        ([key]) => !(standardURLParams.includes(key) || legacyOnlyURLParams.includes(key))
    )
    relevantParams
        .filter(([key]) => store.state.layers.config.some((layer) => layer.id === key))
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
                newQuery.layers += `;${layerId}@features=${featuresIds.split(',').join(':')}`
            }
        })
}

/**
 * @param {String} layerId The layer Id for which we have features
 * @param {String} featuresIds The features ids we need to add as a parameter. This a coma-separated
 *   string
 * @param {String} layers The new Query layers parameter, a semicolon separated string
 * @returns
 */
export function createLayersParamForFeaturePreselection(layerId, featuresIds, layers) {
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

    const [layerIdWithCustomParams, visible, opacity] = layer.split(',')

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
    if (visible || opacity) {
        // we add back the visibility and the opacity
        layerString = `${layerString},${visible},${opacity}`
    }
    // we replace the original layer by the updated layer
    layersArray[layersArray.indexOf(layer)] = layerString
    return layersArray.join(';')
}
