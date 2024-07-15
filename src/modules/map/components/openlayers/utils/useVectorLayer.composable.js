import { Select } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { unByKey } from 'ol/Observable'
import { Vector as VectorSource } from 'ol/source'
import { onUnmounted, toValue, watchEffect } from 'vue'

import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { randomIntBetween } from '@/utils/numberUtils'

export default function useVectorLayer(
    map,
    features,
    zIndex = -1,
    styleFunction = highlightFeatureStyle,
    onFeatureSelectCallback = () => {}, // Add onFeatureSelect parameter with a default no-op function,
    onFeatureDeselectCallback = () => {} // Optional: Callback for when features are deselected
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
        } else if (event.deselected.length > 0) {
            onFeatureDeselectCallback() // Call the deselect callback
        }
    })

    // Add a click listener to the map to handle deselection
    const mapClickListener = map.on('click', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature
        })

        if (!feature) {
            // If no feature is clicked, clear the selection
            selectInteraction.getFeatures().clear()
            onFeatureDeselectCallback() // Call the deselect callback
        }
    })

    watchEffect(() => {
        layer.getSource().clear()
        layer.getSource().addFeatures(toValue(features))
    })

    // Clean up: remove the interaction when the composable is unmounted
    onUnmounted(() => {
        map.removeInteraction(selectInteraction)
        unByKey(mapClickListener) // Remove the click listener from the map
    })

    return {
        layer,
    }
}
