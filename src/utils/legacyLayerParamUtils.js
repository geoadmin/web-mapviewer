import { getKmlMetadataByAdminId } from '@/api/files.api'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import log from '@/utils/logging'

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
                layer = new ExternalWMTSLayer({ name: id, baseUrl: url, externalLayerId: id })
            }
        }
        if (layerId.startsWith('WMS||')) {
            const [_layerType, name, url, id, version] = layerId.split('||')
            // we only decode if we have enough material
            if (url && id) {
                layer = new ExternalWMSLayer({
                    name: name ? name : id,
                    baseUrl: url,
                    externalLayerId: id,
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

export function handleBodLayerIdParam(params, store, newQuery) {
    params.forEach((param_value, param_key) => {
        if (store.state.layers.config.find((layer) => layer.id === param_key)) {
            const featuresIds = param_value.split(',').join(':')
            if (newQuery.layers?.includes(param_key)) {
                newQuery.layers = createLayersParamForFeaturePreselection(
                    param_key,
                    param_value,
                    newQuery.layers
                )
            } else if (newQuery.layers) {
                newQuery.layers = newQuery.layers + `;${param_key}@features=${featuresIds}`
            } else {
                newQuery.layers = `${param_key}@features=${featuresIds}`
            }
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
function createLayersParamForFeaturePreselection(layerId, featuresIds, layers) {
    const featuresArray = featuresIds.split(',')
    // we go through each layer
    const layersArray = layers.split(';')
    for (let layerIndex = 0; layerIndex < layersArray.length; layerIndex++) {
        if (layersArray[layerIndex].includes(layerId)) {
            // here, we manipulate the layer string for which we received a parameter
            const [layerIdWithCustomParams, visible, opacity] = layersArray[layerIndex].split(',')
            // we declare the string that will replace the current string
            let layerString = layerIdWithCustomParams

            if (layerIdWithCustomParams.includes('features')) {
                // if there are features already declared, we need to do some extra work
                const splittedLayer = layerIdWithCustomParams.split('@')
                layerString = splittedLayer[0]
                for (let i = 1; i < splittedLayer.length; i++) {
                    if (splittedLayer[i].includes('features')) {
                        // we mix the features and ensure the unicity of each feature id
                        const featuresIds = splittedLayer[i].split('=')[1].split(':')
                        featuresIds.split(',').forEach((feature_id) => {
                            if (!featuresArray.includes(feature_id)) {
                                featuresArray.push(feature_id)
                            }
                        })
                    } else {
                        // we add the extra param which is not a feature (example : time)
                        layerString = `${layerString}@${splittedLayer[i]}`
                    }
                }
            }
            // we add the features ids to the layer
            layerString = `${layerString}@features=${featuresArray.joins(':')}`
            if (visible || opacity) {
                // we add back the visibility and the opacity
                layerString = `${layerString},${visible},${opacity}`
            }
            layersArray[layerIndex] = layerString
        }
    }
    return layersArray.joins(';')
}
