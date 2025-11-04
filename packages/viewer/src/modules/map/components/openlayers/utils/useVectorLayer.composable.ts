import type { Feature, Map } from 'ol'
import type { StyleFunction } from 'ol/style/Style'

import { randomIntBetween } from '@swissgeo/numbers'
import { Select } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { type MaybeRef, onUnmounted, toValue, unref, watchEffect } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

interface UseVectorLayerOptions {
    /** A callback function that is called when a feature is selected */
    onFeatureSelectCallback?: (feature: Feature) => void
    /** If true, the selected feature will be deselected after the select callback is called */
    deselectAfterSelect?: boolean
}

/**
 * Add a vector layer to the map, and will update its source whenever the feature reference changes.
 *
 * Caveat: it will not update the style!
 *
 * @param map OpenLayers Map instance
 * @param features Reactive array of features to display
 * @param zIndex The z-index of the layer
 * @param styleFunction A function that defines the style for the vector layer
 * @param options Options for the vector layer
 */
export default function useVectorLayer(
    map: MaybeRef<Map>,
    features: MaybeRef<Feature[]>,
    zIndex: MaybeRef<number>,
    styleFunction: MaybeRef<StyleFunction>,
    options?: MaybeRef<UseVectorLayerOptions>
): {
    layer: VectorLayer<VectorSource>
} {
    const { onFeatureSelectCallback = () => {}, deselectAfterSelect = false } = toValue(
        options ?? {}
    )
    // Use unref instead of toValue for styleFunction to avoid unwrapping getter functions.
    // toValue() would call the styleFunction if it's wrapped in a computed ref (getter), but not if it's a regular function value in a ref.
    const unwrappedStyleFunction = unref(styleFunction)

    const layer = new VectorLayer({
        properties: {
            id: `vector-layer-${randomIntBetween(0, 100000)}`,
        },
        source: new VectorSource({
            features: toValue(features),
        }),
        style: unwrappedStyleFunction,
    })
    useAddLayerToMap(layer, map, () => toValue(zIndex))

    // Create and add the Select interaction to the map
    const selectInteraction = new Select({
        layers: [layer], // Only apply the interaction to this layer
        style: undefined, // Do not update the style of the selected features
    })
    toValue(map).addInteraction(selectInteraction)

    // Listen for feature selection
    selectInteraction.on('select', function (event) {
        if (event.selected.length > 0) {
            event.selected.forEach((feature) => {
                onFeatureSelectCallback(feature)
            })
            if (deselectAfterSelect) {
                selectInteraction.getFeatures().clear()
            }
        }
    })

    watchEffect(() => {
        const source = layer.getSource()
        if (source) {
            source.clear()
            source.addFeatures(toValue(features))
        }
    })

    // Clean up: remove the interaction when the composable is unmounted
    onUnmounted(() => {
        toValue(map).removeInteraction(selectInteraction)
    })

    return {
        layer,
    }
}
