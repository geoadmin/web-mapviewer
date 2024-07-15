import { Select } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { onUnmounted, toValue, watchEffect } from 'vue'

import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import { randomIntBetween } from '@/utils/numberUtils'

export default function useVectorLayer(
    map,
    features,
    zIndex = -1,
    styleFunction = highlightFeatureStyle
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
        style: null,
    })
    map.addInteraction(selectInteraction)

    // Listen for feature selection (click events)
    selectInteraction.on('select', function (event) {
        // event.selected contains the selected features
        event.selected.forEach((feature) => {
            console.log('Feature selected:', feature)
            // Handle the feature click event here
        })
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
