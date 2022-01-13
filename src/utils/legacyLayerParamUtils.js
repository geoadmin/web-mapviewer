import KMLLayer from '@/api/layers/KMLLayer.class'
import { getKmlMetadataByAdminId } from '@/api/files.api'

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

const newLayerParamRegex = /^[\w.]+[@\w=]*[,ft]*[,?\d.]*$/

export function isLayersUrlParamLegacy(layersParamValue) {
    const layers = layersParamValue.split(';')
    let isNewSyntax = false
    layers.forEach((layerUrlString) => {
        isNewSyntax |= newLayerParamRegex.test(layerUrlString)
    })
    return !isNewSyntax
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
 * @param {String} legacyLayersParam
 * @returns {AbstractLayer[]}
 */
export function getLayersFromLegacyUrlParams(layersConfig, legacyLayersParam) {
    const layersToBeActivated = []
    if (legacyLayersParam) {
        const layerIdsUrlParam = readUrlParamValue(legacyLayersParam, 'layers')
        const layerVisibilityParam = readUrlParamValue(legacyLayersParam, 'layers_visibility')
        const layerOpacityParam = readUrlParamValue(legacyLayersParam, 'layers_opacity')
        const layerTimestampsParam = readUrlParamValue(legacyLayersParam, 'layers_timestamps')

        const layerVisibilities = []
        if (layerVisibilityParam) {
            layerVisibilities.push(...layerVisibilityParam.split(','))
        }

        const layerOpacities = []
        if (layerOpacityParam) {
            layerOpacities.push(...layerOpacityParam.split(','))
        }

        const layerTimestamps = []
        if (layerTimestampsParam) {
            layerTimestamps.push(...layerTimestampsParam.split(','))
        }

        if (layerIdsUrlParam) {
            layerIdsUrlParam
                .split(',')
                .map(decodeURI)
                .forEach((layerId, index) => {
                    let layer = layersConfig.find((layer) => layer.getID() === layerId)
                    // if this layer can be found in the list of GeoAdminLayers (from the config), we use that as the basis
                    // to add it to the map
                    if (layer) {
                        // we can't modify "layer" straight because it comes from the Vuex state, so we deep copy it
                        // in order to alter it before returning it
                        layer = layer.clone()
                    }
                    if (layerId.startsWith('KML||')) {
                        const kmlLayerParts = decodeURIComponent(layerId).split('||')
                        layer = new KMLLayer(1.0, kmlLayerParts[1])
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
                            layer.opacity = Number(layerOpacities[index])
                        }
                        // checking if a timestamp is defined for this layer
                        if (layerTimestamps.length > index && layerTimestamps[index]) {
                            layer.timeConfig.currentTimestamp = layerTimestamps[index]
                        }
                        layersToBeActivated.push(layer)
                    }
                })
        }
    }
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
            return layersConfig.find((layer) => layer.getID() === bgLayerId)
        }
    }
    return undefined
}

/**
 * Returns a KML Layer from the legacy adminid url param.
 *
 * @param {String} adminId KML admin ID
 * @returns {Promise<AbstractLayer>} KML Layer
 */
export async function getKmlLayerFromLegacyAdminIdParam(adminId) {
    const kmlMetaData = await getKmlMetadataByAdminId(adminId)

    return new KMLLayer(1.0, kmlMetaData.links.kml, kmlMetaData.id, kmlMetaData.adminId)
}
