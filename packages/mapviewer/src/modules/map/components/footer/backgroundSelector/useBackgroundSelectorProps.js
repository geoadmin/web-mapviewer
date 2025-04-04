import { validateLayerProp } from '@geoadmin/layers'

/**
 * @returns {Object} Props definition to use in concert with useBackgroundSelector to build a
 *   BackgroundSelector component.
 */
export default function () {
    return {
        backgroundLayers: {
            type: Array,
            default: () => [],
        },
        currentBackgroundLayer: {
            validator: validateLayerProp,
            default: null,
        },
    }
}
