import { isNumber } from '@/utils/numberUtils'

export class LayersParsedFromURL {
    /**
     * @param {String} id The layer id
     * @param {Boolean} visible Flag telling if the layer should be visible on the map
     * @param {Number | undefined} opacity The opacity that the layers should have, if no opacity is
     *   set in the URL this `undefined`
     * @param {Object} customAttributes Other attributes relevant for this layer, such as time
     */
    constructor(id, visible, opacity, customAttributes = {}) {
        this.id = id
        this.visible = visible
        this.opacity = opacity
        this.customAttributes = customAttributes
    }
}

/**
 * Parses the URL param value for `layers` as described in the ADR :
 * `/adr/2021_03_16_url_param_structure.md`
 *
 * @param {String} queryValue The value of the `layers` URL param
 * @returns {LayersParsedFromURL[]} Metadata for layers that must be activated in the app
 */
const parseLayersParam = (queryValue) => {
    const parsedLayer = []
    if (queryValue && queryValue.length > 0) {
        queryValue.split(';').forEach((layerQueryString) => {
            const [layerIdWithCustomParams, visible, opacity] = layerQueryString.split(',')
            const [layerId, ...otherParams] = layerIdWithCustomParams.split('@')
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
                new LayersParsedFromURL(
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

export default parseLayersParam
