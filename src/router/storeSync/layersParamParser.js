import { isNumber } from '@/utils/numberUtils'
import { ActiveLayerConfig } from '@/store/modules/layers.store'

/**
 * Parses the URL param value for `layers` as described in the ADR :
 * `/adr/2021_03_16_url_param_structure.md`
 *
 * @param {String} queryValue The value of the `layers` URL param
 * @returns {ActiveLayerConfig[]} Metadata for layers that must be activated in the app
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

export default parseLayersParam
