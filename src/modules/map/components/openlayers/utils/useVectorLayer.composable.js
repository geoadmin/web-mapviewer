import { Select } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { onUnmounted, toValue, watchEffect } from 'vue'

import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { randomIntBetween } from '@/utils/numberUtils'

/**
 * Add a vector layer to the map, and will update its source whenever the feature reference changes.
 *
 * Caveat: it will not update the style!
 *
 * @param {Map} map
 * @param {Readonly<Ref<Number>>} zIndex
 * @param {Readonly<Ref<Feature[]>>} features
 * @param {Function} styleFunction
 * @param {Function} onFeatureSelectCallback
 */
export default function useVectorLayer(
    map,
    features,
    zIndex = -1,
    styleFunction = highlightFeatureStyle,
    onFeatureSelectCallback = () => {},
    deselectAfterSelect = false // If true, the selected feature will be deselected after the callback is called
) {
    const layer = new VectorLayer({
        id: `vector-layer-${randomIntBetween(0, 100000)}`,
        source: new VectorSource({
            features: toValue(features),
        }),
        style: styleFunction,
    })
    useAddLayerToMap(layer, map, zIndex)

    // Create and add the Select interaction to the map
    const selectInteraction = new Select({
        layers: [layer], // Only apply the interaction to this layer
        style: null, // Do not update the style of the selected features
    })
    map.addInteraction(selectInteraction)

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
        layer.getSource().clear()
        layer.getSource().addFeatures(toValue(features))
    })

    // Clean up: remove the interaction when the composable is unmounted
    onUnmounted(() => {
        map.removeInteraction(selectInteraction)
    })

    return {
        layer,
    }
}
