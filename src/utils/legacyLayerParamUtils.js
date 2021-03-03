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
 * Reads URL params :
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
 * @param {Layer[]} layersConfig
 * @param {String} legacyLayersParam
 * @returns {Layer[]}
 */
export function getLayersFromLegacyUrlParams(layersConfig, legacyLayersParam) {
    const layersToBeActivated = []
    if (legacyLayersParam) {
        const layerIdsUrlParam = readUrlParamValue(legacyLayersParam, 'layers')
        const layerVisibilityParam = readUrlParamValue(legacyLayersParam, 'layers_visibility')
        const layerOpacityParam = readUrlParamValue(legacyLayersParam, 'layers_opacity')
        if (layerIdsUrlParam) {
            layerIdsUrlParam.split(',').forEach((layerId, index) => {
                let layer = layersConfig.find((layer) => layer.id === layerId)
                if (layer) {
                    // we can't modify "layer" straight because it comes from the Vuex state, so we deep copy it
                    // in order to alter it before returning it
                    layer = Object.assign(Object.create(Object.getPrototypeOf(layer)), layer)
                    // checking if visibility is set in URL
                    if (layerVisibilityParam.split(',').length > index) {
                        layer.visible = layerVisibilityParam.split(',')[index] === 'true'
                    }
                    // checking if opacity is set in the URL
                    if (layerOpacityParam.split(',').length > index) {
                        layer.opacity = Number(layerOpacityParam.split(',')[index])
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
 * @param {Layer[]} layersConfig
 * @param {String} legacyUrlParams
 * @returns {null | undefined | Layer} The background layer defined in the URL (`null` for void
 *   layer, `undefined` if nothing is set in the URL)
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
