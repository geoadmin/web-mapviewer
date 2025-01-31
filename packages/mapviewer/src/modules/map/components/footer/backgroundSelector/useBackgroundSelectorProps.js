import AbstractLayer from '@/api/layers/AbstractLayer.class'

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
            type: AbstractLayer,
            default: null,
        },
    }
}
