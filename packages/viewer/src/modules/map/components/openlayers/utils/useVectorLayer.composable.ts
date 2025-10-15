import type { Feature, Map } from 'ol'
import type { StyleLike } from 'ol/style/Style'
import type { MaybeRef } from 'vue'

import { randomIntBetween } from '@swissgeo/numbers'
import { Select } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { onUnmounted, toValue, watchEffect } from 'vue'

import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

interface UseVectorLayerConfig {
    /** The Z index of the layer */
    zIndex?: number
    /** A function that defines the style for the vector layer */
    styleFunction?: StyleLike
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
 * @param config Configuration options for the vector layer
 */
export default function useVectorLayer(
    map: MaybeRef<Map>,
    features: MaybeRef<Feature[]>,
    config: MaybeRef<UseVectorLayerConfig> = {}
): {
    layer: VectorLayer<VectorSource>
} {
    const {
        zIndex = -1,
        styleFunction = highlightFeatureStyle,
        onFeatureSelectCallback = () => {},
        deselectAfterSelect = false,
    } = toValue(config)
    const layer = new VectorLayer({
        properties: {
            id: `vector-layer-${randomIntBetween(0, 100000)}`,
        },
        source: new VectorSource({
            features: toValue(features),
        }),
        style: styleFunction,
    })
    useAddLayerToMap(layer, map, zIndex)

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
